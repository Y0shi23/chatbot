package services

import (
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"

	"app/models"
)

// MessageService handles message-related business logic
type MessageService struct {
	db *sql.DB
}

// NewMessageService creates a new message service
func NewMessageService(db *sql.DB) *MessageService {
	return &MessageService{
		db: db,
	}
}

// SaveMessage saves a message to the database
func (s *MessageService) SaveMessage(message models.Message) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert message
	_, err = tx.Exec(
		`INSERT INTO messages (id, content, channel_id, user_id, role, timestamp, is_edited, is_deleted) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		message.ID, message.Content, message.ChannelId, message.UserId, message.Role,
		message.Timestamp, message.IsEdited, message.IsDeleted,
	)
	if err != nil {
		return err
	}

	// Insert attachments if any
	for _, attachmentPath := range message.Attachments {
		attachmentId := uuid.New().String()
		fileName := filepath.Base(attachmentPath)
		fileType := getFileType(fileName)
		fileInfo, err := os.Stat(attachmentPath)
		if err != nil {
			return err
		}

		_, err = tx.Exec(
			`INSERT INTO attachments (id, message_id, file_name, file_type, file_path, file_size, uploaded_at) 
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			attachmentId, message.ID, fileName, fileType, attachmentPath, fileInfo.Size(), time.Now(),
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetChannelMessages gets all messages in a channel
func (s *MessageService) GetChannelMessages(channelId string) ([]models.Message, error) {
	rows, err := s.db.Query(`
		SELECT m.id, m.content, m.channel_id, m.user_id, m.role, m.timestamp, m.is_edited, m.is_deleted, m.edited_at
		FROM messages m
		WHERE m.channel_id = $1 AND m.is_deleted = false
		ORDER BY m.timestamp ASC
	`, channelId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		var editedAt sql.NullTime
		if err := rows.Scan(
			&message.ID, &message.Content, &message.ChannelId, &message.UserId,
			&message.Role, &message.Timestamp, &message.IsEdited, &message.IsDeleted, &editedAt,
		); err != nil {
			return nil, err
		}

		if editedAt.Valid {
			message.EditedAt = editedAt.Time
		}

		// Get attachments for this message
		attachmentRows, err := s.db.Query(
			"SELECT file_path FROM attachments WHERE message_id = $1",
			message.ID,
		)
		if err != nil {
			return nil, err
		}
		defer attachmentRows.Close()

		var attachments []string
		for attachmentRows.Next() {
			var path string
			if err := attachmentRows.Scan(&path); err != nil {
				return nil, err
			}
			attachments = append(attachments, path)
		}
		message.Attachments = attachments

		messages = append(messages, message)
	}

	return messages, nil
}

// IsMessageAuthor checks if a user is the author of a message
func (s *MessageService) IsMessageAuthor(messageId, userId string) (bool, error) {
	var authorId string
	err := s.db.QueryRow(
		"SELECT user_id FROM messages WHERE id = $1",
		messageId,
	).Scan(&authorId)
	if err != nil {
		return false, err
	}
	return authorId == userId, nil
}

// CanDeleteMessage checks if a user can delete a message
func (s *MessageService) CanDeleteMessage(messageId, userId string) (bool, error) {
	// Check if user is the author
	isAuthor, err := s.IsMessageAuthor(messageId, userId)
	if err != nil {
		return false, err
	}
	if isAuthor {
		return true, nil
	}

	// If not the author, check if user is an admin or owner of the server
	var channelId string
	err = s.db.QueryRow(
		"SELECT channel_id FROM messages WHERE id = $1",
		messageId,
	).Scan(&channelId)
	if err != nil {
		return false, err
	}

	var serverId string
	err = s.db.QueryRow(
		"SELECT server_id FROM channels WHERE id = $1",
		channelId,
	).Scan(&serverId)
	if err != nil {
		return false, err
	}

	var role string
	err = s.db.QueryRow(
		"SELECT role FROM server_members WHERE server_id = $1 AND user_id = $2",
		serverId, userId,
	).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return role == "owner" || role == "admin", nil
}

// EditMessage edits a message
func (s *MessageService) EditMessage(messageId, content string) error {
	_, err := s.db.Exec(
		"UPDATE messages SET content = $1, is_edited = true, edited_at = $2 WHERE id = $3",
		content, time.Now(), messageId,
	)
	return err
}

// DeleteMessage marks a message as deleted
func (s *MessageService) DeleteMessage(messageId string) error {
	_, err := s.db.Exec(
		"UPDATE messages SET is_deleted = true WHERE id = $1",
		messageId,
	)
	return err
}

// SaveAttachment saves an uploaded file and returns the file path
func (s *MessageService) SaveAttachment(file *multipart.FileHeader) (string, error) {
	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", err
	}

	// Generate a unique filename
	fileExt := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s%s", uuid.New().String(), fileExt)
	filePath := filepath.Join(uploadsDir, newFilename)

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Create the destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy the uploaded file to the destination file
	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	return filePath, nil
}

// GetAttachment gets attachment information
func (s *MessageService) GetAttachment(attachmentId string) (models.Attachment, error) {
	var attachment models.Attachment
	err := s.db.QueryRow(`
		SELECT id, message_id, file_name, file_type, file_path, file_size, uploaded_at
		FROM attachments
		WHERE id = $1
	`, attachmentId).Scan(
		&attachment.ID, &attachment.MessageId, &attachment.FileName,
		&attachment.FileType, &attachment.FilePath, &attachment.FileSize, &attachment.UploadedAt,
	)
	return attachment, err
}

// Helper function to determine file type based on extension
func getFileType(fileName string) string {
	ext := filepath.Ext(fileName)
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp":
		return "image"
	case ".mp4", ".webm", ".mov", ".avi":
		return "video"
	case ".mp3", ".wav", ".ogg":
		return "audio"
	case ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx":
		return "document"
	default:
		return "other"
	}
}
