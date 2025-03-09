package handlers

import (
	"fmt"
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
	channelId := c.Param("id")
	if channelId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Channel ID is required"})
		return
	}

	// Get user ID from context
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is a member of the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this channel"})
		return
	}

	// Parse request
	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create message
	messageId := uuid.New().String()
	message := models.Message{
		ID:        messageId,
		ChannelId: channelId,
		UserId:    userId.(string),
		Content:   req.Content,
		Role:      "user",
		Timestamp: time.Now(),
	}

	// Handle file uploads if any
	var attachments []string
	form, err := c.MultipartForm()
	if err == nil && form.File != nil {
		files := form.File["files"]
		for _, file := range files {
			// Save file and get path
			filePath, err := h.messageService.SaveAttachment(file, messageId)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルのアップロードに失敗しました"})
				return
			}
			attachments = append(attachments, filePath)
		}
	}

	// Add attachments to message
	message.Attachments = attachments

	// Save message
	if err := h.messageService.SaveMessage(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, message)
}

// GetChannelMessages gets all messages in a channel
func (h *MessageHandler) GetChannelMessages(c *gin.Context) {
	channelId := c.Param("id")
	if channelId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Channel ID is required"})
		return
	}

	// Get user ID from context
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is a member of the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this channel"})
		return
	}

	// Get messages
	messages, err := h.messageService.GetChannelMessages(channelId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// messagesがnilの場合は空の配列を返す
	if messages == nil {
		messages = []models.Message{}
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
	})
}

// EditMessage edits a message
func (h *MessageHandler) EditMessage(c *gin.Context) {
	messageId := c.Param("id")
	if messageId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message ID is required"})
		return
	}

	// Get user ID from context
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is the author of the message
	isAuthor, err := h.messageService.IsMessageAuthor(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !isAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the author of this message"})
		return
	}

	// Parse request
	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Edit message
	if err := h.messageService.EditMessage(messageId, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message updated successfully"})
}

// DeleteMessage deletes a message
func (h *MessageHandler) DeleteMessage(c *gin.Context) {
	messageId := c.Param("id")
	if messageId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message ID is required"})
		return
	}

	// Get user ID from context
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user can delete the message
	canDelete, err := h.messageService.CanDeleteMessage(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !canDelete {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to delete this message"})
		return
	}

	// Delete message
	if err := h.messageService.DeleteMessage(messageId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
}

// GetAttachment gets an attachment
func (h *MessageHandler) GetAttachment(c *gin.Context) {
	attachmentId := c.Param("id")
	if attachmentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Attachment ID is required"})
		return
	}

	// Get attachment
	attachment, err := h.messageService.GetAttachment(attachmentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Serve file
	c.File(attachment.FilePath)
}

// UploadFile uploads a file
func (h *MessageHandler) UploadFile(c *gin.Context) {
	// Get channel ID
	channelId := c.Param("id")
	if channelId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Channel ID is required"})
		return
	}

	// Get user ID from context
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is a member of the channel
	hasAccess, err := h.serverService.HasChannelAccess(channelId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this channel"})
		return
	}

	// Get file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	fmt.Println("File:", file)
	fmt.Println("File name:", file.Filename)
	fmt.Println("File size:", file.Size)

	// Create a message ID for the attachment
	messageId := uuid.New().String()

	// Save file and get path
	filePath, err := h.messageService.SaveAttachment(file, messageId)
	if err != nil {
		fmt.Println("SaveAttachment error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルのアップロードに失敗しました: " + err.Error()})
		return
	}
	fmt.Println("File saved at:", filePath)

	// Create a message with the attachments
	message := models.Message{
		ID:          messageId,
		ChannelId:   channelId,
		UserId:      userId.(string),
		Content:     "ファイルがアップロードされました",
		Role:        "user",
		Timestamp:   time.Now(),
		Attachments: []string{filePath},
	}

	// Save message
	if err := h.messageService.SaveMessage(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"path":    filePath,
	})
}
