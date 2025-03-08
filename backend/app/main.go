package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"app/db"
	"app/handlers"
	"app/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sashabaranov/go-openai"
)

func main() {
	// OpenAIクライアントの初期化
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		panic("OPENAI_API_KEY is not set")
	}
	openAIClient := openai.NewClient(apiKey)

	// JWT secret の確認
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		panic("JWT_SECRET is not set")
	}

	// データベース接続の初期化
	db, err := db.NewDB()
	if err != nil {
		panic(fmt.Sprintf("データベース接続に失敗しました: %s", err))
	}
	defer db.Close()

	// サービスとハンドラーの初期化
	chatService := services.NewChatService(db, openAIClient)
	chatHandler := handlers.NewChatHandler(chatService)

	// ユーザー認証サービスとハンドラーの初期化
	userService := services.NewUserService(db)
	authHandler := handlers.NewAuthHandler(userService)

	// サーバーとメッセージのサービスとハンドラーの初期化
	serverService := services.NewServerService(db)
	serverHandler := handlers.NewServerHandler(serverService)
	messageService := services.NewMessageService(db)
	messageHandler := handlers.NewMessageHandler(messageService, serverService)

	// リリースモードに設定
	gin.SetMode(gin.ReleaseMode)

	engine := gin.Default()

	// 信頼するプロキシを設定
	engine.SetTrustedProxies([]string{"127.0.0.1"})

	// CORSの設定
	engine.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost:5173", "http://frontend:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
		},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 認証ルート（認証不要）
	engine.POST("/api/auth/register", authHandler.Register)
	engine.POST("/api/auth/login", authHandler.Login)

	// 認証済みユーザー向けルート
	authRoutes := engine.Group("/api")
	authRoutes.Use(handlers.AuthMiddleware(userService))
	{
		authRoutes.GET("/auth/me", authHandler.GetCurrentUser)
		authRoutes.POST("/chat", chatHandler.CreateChat)
		authRoutes.GET("/chat/history", chatHandler.GetChatHistory)
		authRoutes.GET("/chat/:id", chatHandler.GetChat)
		authRoutes.POST("/chat/:id", chatHandler.AddMessage)

		// サーバー関連のルート
		authRoutes.POST("/servers", serverHandler.CreateServer)
		authRoutes.GET("/servers", serverHandler.GetUserServers)
		authRoutes.GET("/servers/:serverId/channels", serverHandler.GetServerChannels)
		authRoutes.POST("/servers/:serverId/channels", serverHandler.CreateChannel)
		authRoutes.POST("/servers/:serverId/join", serverHandler.JoinServer)
		authRoutes.POST("/channels/:channelId/members", serverHandler.AddChannelMember)

		// メッセージ関連のルート
		authRoutes.GET("/channels/:channelId/messages", messageHandler.GetChannelMessages)
		authRoutes.POST("/channels/:channelId/messages", messageHandler.SendChannelMessage)
		authRoutes.PUT("/messages/:messageId", messageHandler.EditMessage)
		authRoutes.DELETE("/messages/:messageId", messageHandler.DeleteMessage)
		authRoutes.GET("/attachments/:attachmentId", messageHandler.GetAttachment)
	}

	// サーバーの設定
	server := &http.Server{
		Addr:         ":3000",
		Handler:      engine,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("サーバーの起動に失敗しました: %s", err))
	}
}
