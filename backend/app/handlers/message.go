package handlers

import (
	"net/http"
	"time"

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
	var req models.MessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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
		Content:     req.Content,
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
