// 主なビジネスロジックを実装：
// データベース操作
// OpenAI APIとの連携
// チャットの作成・取得・メッセージ追加の処理
// 特筆すべき機能：
// トランザクション管理
// OpenAI GPT-3.5-turboを使用した応答生成
// システムプロンプトとして日本語アシスタントの設定
package services

import (
	"app/models"
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/sashabaranov/go-openai"
)

// チャットのビジネスロジックを管理するサービス
type ChatService struct {
	db           *sql.DB        // データベース接続
	openAIClient *openai.Client // OpenAI APIクライアント
}

// 新しいChatServiceを作成
func NewChatService(db *sql.DB, openAIClient *openai.Client) *ChatService {
	return &ChatService{
		db:           db,
		openAIClient: openAIClient,
	}
}

func (s *ChatService) CreateNewChat(message string, userID string) (string, []models.Message, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return "", nil, fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	chatID := uuid.New().String()
	// タイトルを安全に生成
	title := ""
	if len(message) > 30 {
		// UTF-8文字列を正しく処理
		runes := []rune(message)
		if len(runes) > 30 {
			title = string(runes[:30]) + "..."
		} else {
			title = message + "..."
		}
	} else {
		title = message
	}

	_, err = tx.Exec(`
		INSERT INTO chats (id, title, message_count, last_message_at, user_id) 
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
	`, chatID, title, 2, userID)
	if err != nil {
		return "", nil, fmt.Errorf("failed to insert chat: %v", err)
	}

	var messages []models.Message

	// ユーザーメッセージを作成
	userMessage := models.Message{
		ID:        uuid.New().String(),
		Content:   message,
		Role:      "user",
		Timestamp: time.Now(),
	}
	messages = append(messages, userMessage)

	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, userMessage.ID, chatID, message, "user", userMessage.Timestamp)
	if err != nil {
		return "", nil, fmt.Errorf("failed to insert user message: %v", err)
	}

	response, err := s.generateOpenAIResponse([]models.Message{{
		Content: message,
		Role:    "user",
	}})
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate OpenAI response: %v", err)
	}

	// アシスタントメッセージを作成
	assistantMessage := models.Message{
		ID:        uuid.New().String(),
		Content:   response,
		Role:      "assistant",
		Timestamp: time.Now(),
	}
	messages = append(messages, assistantMessage)

	_, err = tx.Exec(`
		INSERT INTO messages (id, chat_id, content, role, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, assistantMessage.ID, chatID, response, "assistant", assistantMessage.Timestamp)
	if err != nil {
		return "", nil, fmt.Errorf("failed to insert assistant message: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return "", nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return chatID, messages, nil
}

// 指定されたチャットIDの会話履歴を取得
func (s *ChatService) GetChat(chatID string, userID string) (*models.Chat, bool) {
	chat := &models.Chat{ID: chatID}

	// チャットの所有権を確認
	var count int
	err := s.db.QueryRow(`
		SELECT COUNT(*)
		FROM chats
		WHERE id = $1 AND user_id = $2
	`, chatID, userID).Scan(&count)

	if err != nil || count == 0 {
		return nil, false
	}

	// メッセージを時系列順に取得
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
	// メッセージを時系列順に取得して返却
	return chat, true
}

func (s *ChatService) AddMessage(chatID string, message string, userID string) (*models.Message, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// チャットの所有権を確認
	var exists bool
	err = tx.QueryRow(`
		SELECT EXISTS(
			SELECT 1 
			FROM chats 
			WHERE id = $1 AND user_id = $2
		)
	`, chatID, userID).Scan(&exists)

	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, nil
	}

	// チャットのメタデータを更新
	_, err = tx.Exec(`
		UPDATE chats
		SET message_count = message_count + 2,
		    last_message_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`, chatID)
	if err != nil {
		return nil, err
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
			Model:       "gpt-4o-mini", //GPT-4o-1miniを使用
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

// すべてのチャット履歴を取得
func (s *ChatService) GetChatHistory(userID string) ([]models.ChatSummary, error) {
	rows, err := s.db.Query(`
		WITH FirstMessages AS (
			SELECT DISTINCT ON (chat_id)
				chat_id,
				content
			FROM messages
			WHERE role = 'user'
			ORDER BY chat_id, timestamp
		)
		SELECT 
			c.id,
			c.created_at,
			c.title,
			c.last_message_at,
			c.message_count,
			fm.content as first_message
		FROM chats c
		LEFT JOIN FirstMessages fm ON c.id = fm.chat_id
		WHERE c.user_id = $1
		ORDER BY c.last_message_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chats []models.ChatSummary
	for rows.Next() {
		var chat models.ChatSummary
		err := rows.Scan(
			&chat.ID,
			&chat.CreatedAt,
			&chat.Title,
			&chat.LastMessageAt,
			&chat.MessageCount,
			&chat.FirstMessage,
		)
		if err != nil {
			return nil, err
		}
		chats = append(chats, chat)
	}

	return chats, nil
}
