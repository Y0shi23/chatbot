package services

import (
	"app/models"
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/sashabaranov/go-openai"
)

type ChatService struct {
	db           *sql.DB
	openAIClient *openai.Client
}

func NewChatService(db *sql.DB, openAIClient *openai.Client) *ChatService {
	return &ChatService{
		db:           db,
		openAIClient: openAIClient,
	}
}

func (s *ChatService) CreateNewChat(message string) (string, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	chatID := uuid.New().String()
	_, err = tx.Exec(`INSERT INTO chats (id) VALUES ($1)`, chatID)
	if err != nil {
		return "", err
	}

	messageID := uuid.New().String()
	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, messageID, chatID, message, "user", time.Now())
	if err != nil {
		return "", err
	}

	response, err := s.generateOpenAIResponse([]models.Message{{
		Content: message,
		Role:    "user",
	}})
	if err != nil {
		return "", err
	}

	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, uuid.New().String(), chatID, response, "assistant", time.Now())
	if err != nil {
		return "", err
	}

	if err = tx.Commit(); err != nil {
		return "", err
	}

	return chatID, nil
}

func (s *ChatService) GetChat(chatID string) (*models.Chat, bool) {
	chat := &models.Chat{ID: chatID}

	rows, err := s.db.Query(`
		SELECT id, content, role, timestamp
		FROM messages
		WHERE chat_id = $1
		ORDER BY timestamp
	`, chatID)
	if err != nil {
		return nil, false
	}
	defer rows.Close()

	for rows.Next() {
		var msg models.Message
		err := rows.Scan(&msg.ID, &msg.Content, &msg.Role, &msg.Timestamp)
		if err != nil {
			return nil, false
		}
		chat.Messages = append(chat.Messages, msg)
	}

	if len(chat.Messages) == 0 {
		return nil, false
	}

	return chat, true
}

func (s *ChatService) AddMessage(chatID string, message string) (*models.Message, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// チャットの存在確認
	var exists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM chats WHERE id = $1)", chatID).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, nil
	}

	// ユーザーメッセージを保存
	userMessage := models.Message{
		ID:        uuid.New().String(),
		Content:   message,
		Role:      "user",
		Timestamp: time.Now(),
	}
	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, userMessage.ID, chatID, userMessage.Content, userMessage.Role, userMessage.Timestamp)
	if err != nil {
		return nil, err
	}

	// 全メッセージを取得してOpenAIに送信
	rows, err := tx.Query(`
		SELECT content, role
		FROM messages
		WHERE chat_id = $1
		ORDER BY timestamp
	`, chatID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		err := rows.Scan(&msg.Content, &msg.Role)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	// OpenAIの応答を生成
	response, err := s.generateOpenAIResponse(messages)
	if err != nil {
		return nil, err
	}

	// アシスタントの応答を保存
	assistantMessage := models.Message{
		ID:        uuid.New().String(),
		Content:   response,
		Role:      "assistant",
		Timestamp: time.Now(),
	}
	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, assistantMessage.ID, chatID, assistantMessage.Content, assistantMessage.Role, assistantMessage.Timestamp)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &assistantMessage, nil
}

func (s *ChatService) generateOpenAIResponse(messages []models.Message) (string, error) {
	var openAIMessages []openai.ChatCompletionMessage

	for _, msg := range messages {
		role := msg.Role
		if role == "user" {
			role = "user"
		} else {
			role = "assistant"
		}

		openAIMessages = append(openAIMessages, openai.ChatCompletionMessage{
			Role:    role,
			Content: msg.Content,
		})
	}

	openAIMessages = append([]openai.ChatCompletionMessage{
		{
			Role:    "system",
			Content: "あなたは親切で丁寧な日本語アシスタントです。ユーザーの質問に対して、簡潔で分かりやすい回答を提供してください。",
		},
	}, openAIMessages...)

	resp, err := s.openAIClient.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:       openai.GPT3Dot5Turbo,
			Messages:    openAIMessages,
			MaxTokens:   500,
			Temperature: 0.7,
		},
	)

	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}
