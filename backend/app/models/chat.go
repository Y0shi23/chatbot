package models

import (
	"time"
)

type Message struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	Role      string    `json:"role"`
	Timestamp time.Time `json:"timestamp"`
}

type Chat struct {
	ID       string    `json:"id"`
	Messages []Message `json:"messages"`
}

type ChatResponse struct {
	Message     string
	Suggestions []string
}
