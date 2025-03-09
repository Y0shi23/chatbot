package handlers

import (
	"app/models"
	"app/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ChannelMessageHandler handles channel message-related HTTP requests
type ChannelMessageHandler struct {
	channelMessageService *services.ChannelMessageService
	serverService         *services.ServerService
}

// NewChannelMessageHandler creates a new channel message handler
func NewChannelMessageHandler(channelMessageService *services.ChannelMessageService, serverService *services.ServerService) *ChannelMessageHandler {
	return &ChannelMessageHandler{
		channelMessageService: channelMessageService,
		serverService:         serverService,
	}
}

// GetChannelMessages retrieves all messages for a specific channel
func (h *ChannelMessageHandler) GetChannelMessages(c *gin.Context) {
	channelId := c.Param("id")
	if channelId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Channel ID is required"})
		return
	}

	// Check if user is authenticated
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// For now, we'll skip the channel membership check
	// In a real implementation, you would check if the user is a member of the channel
	// using a method like h.serverService.IsChannelMember(channelId, userId.(string))

	// Get messages
	messages, err := h.channelMessageService.GetChannelMessages(channelId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// messagesがnilの場合は空の配列を返す
	if messages == nil {
		messages = []models.ChannelMessageWithUser{}
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
	})
}

// CreateChannelMessage creates a new message in a channel
func (h *ChannelMessageHandler) CreateChannelMessage(c *gin.Context) {
	channelId := c.Param("id")
	if channelId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Channel ID is required"})
		return
	}

	// Check if user has access to the channel
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// For now, we'll skip the channel membership check
	// In a real implementation, you would check if the user is a member of the channel
	// using a method like h.serverService.IsChannelMember(channelId, userId.(string))

	// Parse request
	var req models.ChannelMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create message
	message := models.ChannelMessage{
		ID:        uuid.New().String(),
		ChannelId: channelId,
		UserId:    userId.(string),
		Content:   req.Content,
		Timestamp: time.Now(),
		IsEdited:  false,
		IsDeleted: false,
	}

	// Save message
	if err := h.channelMessageService.SaveChannelMessage(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Handle attachments if any
	if len(req.Attachments) > 0 {
		// In a real implementation, you would process each attachment
		// For now, we'll just log that there are attachments
		c.JSON(http.StatusCreated, gin.H{
			"message": message,
			"note":    "Attachments were provided but not processed in this implementation",
		})
		return
	}

	c.JSON(http.StatusCreated, message)
}

// EditChannelMessage edits a channel message
func (h *ChannelMessageHandler) EditChannelMessage(c *gin.Context) {
	messageId := c.Param("id")
	if messageId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message ID is required"})
		return
	}

	// Check if user is authenticated
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is the author of the message
	isAuthor, err := h.channelMessageService.IsMessageAuthor(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !isAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the author of this message"})
		return
	}

	// Parse request
	var req models.EditChannelMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Edit message
	if err := h.channelMessageService.EditChannelMessage(messageId, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message updated successfully"})
}

// DeleteChannelMessage deletes a channel message
func (h *ChannelMessageHandler) DeleteChannelMessage(c *gin.Context) {
	messageId := c.Param("id")
	if messageId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message ID is required"})
		return
	}

	// Check if user is authenticated
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is the author of the message
	isAuthor, err := h.channelMessageService.IsMessageAuthor(messageId, userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !isAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the author of this message"})
		return
	}

	// Delete message
	if err := h.channelMessageService.DeleteChannelMessage(messageId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
}

// UploadChannelAttachment uploads a file attachment for a channel message
func (h *ChannelMessageHandler) UploadChannelAttachment(c *gin.Context) {
	// Check if user is authenticated
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get message ID
	messageId := c.PostForm("messageId")
	if messageId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message ID is required"})
		return
	}

	// Get file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	// Save attachment
	attachmentId, err := h.channelMessageService.SaveChannelAttachment(file, messageId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"attachmentId": attachmentId})
}

// GetChannelAttachment retrieves an attachment
func (h *ChannelMessageHandler) GetChannelAttachment(c *gin.Context) {
	attachmentId := c.Param("id")
	if attachmentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Attachment ID is required"})
		return
	}

	// Get attachment
	attachment, err := h.channelMessageService.GetChannelAttachment(attachmentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.File(attachment.FilePath)
}
