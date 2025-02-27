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

	// データベース接続の初期化
	db, err := db.NewDB()
	if err != nil {
		panic(fmt.Sprintf("データベース接続に失敗しました: %s", err))
	}
	defer db.Close()

	// サービスとハンドラーの初期化
	chatService := services.NewChatService(db, openAIClient)
	chatHandler := handlers.NewChatHandler(chatService)

	// リリースモードに設定
	gin.SetMode(gin.ReleaseMode)

	engine := gin.Default()

	// 信頼するプロキシを設定
	engine.SetTrustedProxies([]string{"127.0.0.1"})

	// CORSの設定
	engine.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
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

	// ルーティング
	engine.POST("/api/chat", chatHandler.CreateChat)
	engine.GET("/api/chat/:id", chatHandler.GetChat)
	engine.POST("/api/chat/:id", chatHandler.AddMessage)

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
