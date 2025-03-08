package handlers

import (
	"fmt"
	"net/http"
	"time"

	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"app/models"
	"app/services"
)

// MessageHandler handles message-related requests
type MessageHandler struct {
	messageService *services.MessageService
	serverService  *services.ServerService
}

// NewMessageHandler creates a new message handler
func NewMessageHandler(messageService *services.MessageService, serverService *services.ServerService) *MessageHandler {
	return &MessageHandler{
		messageService: messageService,
		serverService:  serverService,
	}
}

// SendChannelMessage sends a message to a channel
func (h *MessageHandler) SendChannelMessage(c *gin.Context) {
	channelId := c.Param("channelId")

	// デバッグ: リクエストの内容を確認
	fmt.Println("Content-Type:", c.GetHeader("Content-Type"))

	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	// Check if user has access to the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "チャンネルアクセスの確認に失敗しました"})
		return
	}

	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "このチャンネルにアクセスする権限がありません"})
		return
	}

	// Get content from form data
	content := c.PostForm("content")
	fmt.Println("Content from form:", content)

	// フォームデータが取得できない場合はJSONからも試みる
	if content == "" {
		var jsonData struct {
			Content string `json:"content"`
		}
		if err := c.ShouldBindJSON(&jsonData); err == nil {
			content = jsonData.Content
			fmt.Println("Content from JSON:", content)
		}
	}

	if content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "メッセージ内容が必要です"})
		return
	}

	// Handle file uploads if any
	var attachments []string
	form, err := c.MultipartForm()
	if err == nil && form.File != nil {
		files := form.File["files"]
		for _, file := range files {
			// Save file and get path
			filePath, err := h.messageService.SaveAttachment(file)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルのアップロードに失敗しました"})
				return
			}
			attachments = append(attachments, filePath)
		}
	}

	message := models.Message{
		ID:          uuid.New().String(),
		Content:     content,
		ChannelId:   channelId,
		UserId:      userId.(string),
		Role:        "user",
		Timestamp:   time.Now(),
		Attachments: attachments,
		IsEdited:    false,
		IsDeleted:   false,
	}

	if err := h.messageService.SaveMessage(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの送信に失敗しました"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": message,
	})
}

// GetChannelMessages gets all messages in a channel
func (h *MessageHandler) GetChannelMessages(c *gin.Context) {
	channelId := c.Param("channelId")
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	// Check if user has access to the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "チャンネルアクセスの確認に失敗しました"})
		return
	}

	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "このチャンネルにアクセスする権限がありません"})
		return
	}

	messages, err := h.messageService.GetChannelMessages(channelId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの取得に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

// EditMessage edits a message
func (h *MessageHandler) EditMessage(c *gin.Context) {
	messageId := c.Param("messageId")
	var req models.EditMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	// Check if user is the message author
	isAuthor, err := h.messageService.IsMessageAuthor(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの確認に失敗しました"})
		return
	}

	if !isAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "このメッセージを編集する権限がありません"})
		return
	}

	if err := h.messageService.EditMessage(messageId, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの編集に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "メッセージが編集されました"})
}

// DeleteMessage marks a message as deleted
func (h *MessageHandler) DeleteMessage(c *gin.Context) {
	messageId := c.Param("messageId")
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	// Check if user is the message author or has admin rights
	canDelete, err := h.messageService.CanDeleteMessage(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "権限の確認に失敗しました"})
		return
	}

	if !canDelete {
		c.JSON(http.StatusForbidden, gin.H{"error": "このメッセージを削除する権限がありません"})
		return
	}

	if err := h.messageService.DeleteMessage(messageId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの削除に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "メッセージが削除されました"})
}

// GetAttachment retrieves an attachment file
func (h *MessageHandler) GetAttachment(c *gin.Context) {
	attachmentId := c.Param("attachmentId")
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	// Get attachment info
	attachment, err := h.messageService.GetAttachment(attachmentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "添付ファイルの情報取得に失敗しました"})
		return
	}

	// Check if user has access to the channel where the attachment was posted
	hasAccess, err := h.serverService.HasChannelAccess(attachment.MessageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "チャンネルアクセスの確認に失敗しました"})
		return
	}

	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "この添付ファイルにアクセスする権限がありません"})
		return
	}

	// Serve the file
	c.File(attachment.FilePath)
}

// UploadFile handles file uploads for a channel
func (h *MessageHandler) UploadFile(c *gin.Context) {
	fmt.Println("\n\n=== UploadFile handler called ===")
	channelId := c.Param("channelId")
	fmt.Println("Channel ID:", channelId)

	// デバッグ: リクエストの内容を確認
	fmt.Println("Content-Type:", c.GetHeader("Content-Type"))
	fmt.Println("Request method:", c.Request.Method)
	fmt.Println("Request URL:", c.Request.URL.String())

	// フォームデータを解析する前にリクエストヘッダーを出力
	for k, v := range c.Request.Header {
		fmt.Printf("Header %s: %v\n", k, v)
	}

	userId, exists := c.Get("userID")
	if !exists {
		fmt.Println("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}
	fmt.Println("User ID:", userId)

	// Check if user has access to the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		fmt.Println("HasChannelAccess error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "チャンネルアクセスの確認に失敗しました"})
		return
	}

	if !hasAccess {
		fmt.Println("User does not have access to the channel")
		c.JSON(http.StatusForbidden, gin.H{"error": "このチャンネルにアクセスする権限がありません"})
		return
	}

	// マルチパートフォームの内容を確認
	fmt.Println("Parsing multipart form...")
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		fmt.Println("ParseMultipartForm error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "マルチパートフォームの解析に失敗しました: " + err.Error()})
		return
	}

	if c.Request.MultipartForm == nil {
		fmt.Println("MultipartForm is nil")
		c.JSON(http.StatusBadRequest, gin.H{"error": "マルチパートフォームが見つかりません"})
		return
	}

	fmt.Println("Form values:", c.Request.MultipartForm.Value)
	fmt.Println("Form files:", c.Request.MultipartForm.File)

	// テキストメッセージを取得（存在する場合）
	var content string
	if contentValues, exists := c.Request.MultipartForm.Value["content"]; exists && len(contentValues) > 0 {
		content = contentValues[0]
		fmt.Println("Message content from form:", content)
		// 空文字列の場合は明示的にログに出力
		if content == "" {
			fmt.Println("Warning: Content is empty string")
		}
	} else {
		fmt.Println("No content field found in form data")
	}

	// ファイルを探す
	var file *multipart.FileHeader

	// まず 'file' キーを試す
	if files, ok := c.Request.MultipartForm.File["file"]; ok && len(files) > 0 {
		fmt.Println("Found file with key 'file'")
		file = files[0]
	} else if files, ok := c.Request.MultipartForm.File["files[]"]; ok && len(files) > 0 {
		fmt.Println("Found file with key 'files[]'")
		file = files[0]
	} else {
		// 他のキーを試す
		for k, files := range c.Request.MultipartForm.File {
			fmt.Printf("Form file key %s has %d files\n", k, len(files))
			for i, f := range files {
				fmt.Printf("  File %d: %s, size: %d\n", i, f.Filename, f.Size)
			}

			if len(files) > 0 {
				fmt.Printf("Using file from key %s\n", k)
				file = files[0]
				break
			}
		}
	}

	if file == nil {
		fmt.Println("No files found in the form")
		c.JSON(http.StatusBadRequest, gin.H{"error": "ファイルが選択されていません"})
		return
	}

	fmt.Println("File:", file)
	fmt.Println("File name:", file.Filename)
	fmt.Println("File size:", file.Size)

	// Save file and get path
	filePath, err := h.messageService.SaveAttachment(file)
	if err != nil {
		fmt.Println("SaveAttachment error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルのアップロードに失敗しました: " + err.Error()})
		return
	}
	fmt.Println("File saved at:", filePath)

	// Create a message with the attachments
	message := models.Message{
		ID:          uuid.New().String(),
		Content:     content, // フォームから取得したコンテンツを使用
		ChannelId:   channelId,
		UserId:      userId.(string),
		Role:        "user",
		Timestamp:   time.Now(),
		Attachments: []string{filePath},
		IsEdited:    false,
		IsDeleted:   false,
	}

	if err := h.messageService.SaveMessage(message); err != nil {
		fmt.Println("SaveMessage error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メッセージの保存に失敗しました"})
		return
	}

	fmt.Println("Message saved successfully")
	c.JSON(http.StatusCreated, gin.H{
		"message": message,
		"files":   []string{filePath},
	})
	fmt.Println("=== UploadFile handler completed ===\n\n")
}
