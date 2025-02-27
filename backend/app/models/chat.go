// チャットとメッセージの基本的なデータ構造を定義しています。
package models

import (
	"time"
)

// チャットのメッセージを表す構造体
type Message struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	Role      string    `json:"role"`
	Timestamp time.Time `json:"timestamp"`
}

// チャットの構造体
type Chat struct {
	ID       string    `json:"id"`
	Messages []Message `json:"messages"`
}

// チャットのレスポンスを表す構造体
type ChatResponse struct {
	Message     string
	Suggestions []string
}

// チャット履歴の要約情報
type ChatSummary struct {
	ID            string    `json:"id"`
	CreatedAt     time.Time `json:"createdAt"`
	Title         string    `json:"title"`
	LastMessageAt time.Time `json:"lastMessageAt"`
	MessageCount  int       `json:"messageCount"`
	FirstMessage  string    `json:"firstMessage"`
}
