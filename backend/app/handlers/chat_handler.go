package handlers

import (
	"net/http"

	"app/services"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	chatService *services.ChatService
}

func NewChatHandler(chatService *services.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: chatService,
	}
}

func (h *ChatHandler) CreateChat(c *gin.Context) {
	var req struct {
		Message string `json:"message"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	if req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Message cannot be empty",
		})
		return
	}

	chatID, err := h.chatService.CreateNewChat(req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chatId": chatID,
	})
}

func (h *ChatHandler) GetChat(c *gin.Context) {
	chatID := c.Param("id")
	chat, exists := h.chatService.GetChat(chatID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": chat.Messages,
	})
}

func (h *ChatHandler) AddMessage(c *gin.Context) {
	chatID := c.Param("id")
	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	message, err := h.chatService.AddMessage(chatID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate response"})
		return
	}

	if message == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": message,
		"status":  "success",
	})
}
