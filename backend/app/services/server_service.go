package services

import (
	"database/sql"

	"app/models"
)

// ServerService handles server-related business logic
type ServerService struct {
	db *sql.DB
}

// NewServerService creates a new server service
func NewServerService(db *sql.DB) *ServerService {
	return &ServerService{
		db: db,
	}
}

// CreateServer creates a new server
func (s *ServerService) CreateServer(server models.Server) error {
	_, err := s.db.Exec(
		"INSERT INTO servers (id, name, description, owner_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
		server.ID, server.Name, server.Description, server.OwnerId, server.CreatedAt, server.UpdatedAt,
	)
	return err
}

// CreateChannel creates a new channel in a server
func (s *ServerService) CreateChannel(channel models.Channel) error {
	_, err := s.db.Exec(
		"INSERT INTO channels (id, server_id, name, description, is_private, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		channel.ID, channel.ServerId, channel.Name, channel.Description, channel.IsPrivate, channel.CreatedAt, channel.UpdatedAt,
	)
	return err
}

// AddServerMember adds a user to a server
func (s *ServerService) AddServerMember(member models.ServerMember) error {
	_, err := s.db.Exec(
		"INSERT INTO server_members (id, server_id, user_id, role, joined_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
		member.ID, member.ServerId, member.UserId, member.Role, member.JoinedAt, member.UpdatedAt,
	)
	return err
}

// AddChannelMember adds a user to a private channel
func (s *ServerService) AddChannelMember(member models.ChannelMember) error {
	_, err := s.db.Exec(
		"INSERT INTO channel_members (id, channel_id, user_id, added_at) VALUES ($1, $2, $3, $4)",
		member.ID, member.ChannelId, member.UserId, member.AddedAt,
	)
	return err
}

// GetUserServers returns all servers a user is a member of
func (s *ServerService) GetUserServers(userId string) ([]models.ServerResponse, error) {
	rows, err := s.db.Query(`
		SELECT s.id, s.name, s.description, s.owner_id, s.created_at, 
		       (SELECT COUNT(*) FROM server_members WHERE server_id = s.id) as member_count
		FROM servers s
		JOIN server_members sm ON s.id = sm.server_id
		WHERE sm.user_id = $1
		ORDER BY s.created_at DESC
	`, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var servers []models.ServerResponse
	for rows.Next() {
		var server models.ServerResponse
		if err := rows.Scan(
			&server.ID, &server.Name, &server.Description, &server.OwnerId,
			&server.CreatedAt, &server.MemberCount,
		); err != nil {
			return nil, err
		}
		servers = append(servers, server)
	}

	return servers, nil
}

// GetServerChannels returns all channels in a server that a user has access to
func (s *ServerService) GetServerChannels(serverId, userId string) ([]models.ChannelResponse, error) {
	rows, err := s.db.Query(`
		SELECT c.id, c.server_id, c.name, c.description, c.is_private, c.created_at
		FROM channels c
		WHERE c.server_id = $1 AND (
			c.is_private = false OR 
			EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = $2)
		)
		ORDER BY c.name ASC
	`, serverId, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var channels []models.ChannelResponse
	for rows.Next() {
		var channel models.ChannelResponse
		if err := rows.Scan(
			&channel.ID, &channel.ServerId, &channel.Name, &channel.Description,
			&channel.IsPrivate, &channel.CreatedAt,
		); err != nil {
			return nil, err
		}
		channels = append(channels, channel)
	}

	return channels, nil
}

// IsServerMember checks if a user is a member of a server
func (s *ServerService) IsServerMember(serverId, userId string) (bool, error) {
	var exists bool
	err := s.db.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2)",
		serverId, userId,
	).Scan(&exists)
	return exists, err
}

// HasChannelManagementPermission checks if a user has permission to manage channels
func (s *ServerService) HasChannelManagementPermission(serverId, userId string) (bool, error) {
	var role string
	err := s.db.QueryRow(
		"SELECT role FROM server_members WHERE server_id = $1 AND user_id = $2",
		serverId, userId,
	).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return role == "owner", nil
}

// IsChannelPrivate checks if a channel is private
func (s *ServerService) IsChannelPrivate(channelId string) (bool, error) {
	var isPrivate bool
	err := s.db.QueryRow(
		"SELECT is_private FROM channels WHERE id = $1",
		channelId,
	).Scan(&isPrivate)
	return isPrivate, err
}

// GetServerIdByChannelId returns the server ID for a channel
func (s *ServerService) GetServerIdByChannelId(channelId string) (string, error) {
	var serverId string
	err := s.db.QueryRow(
		"SELECT server_id FROM channels WHERE id = $1",
		channelId,
	).Scan(&serverId)
	return serverId, err
}

// HasChannelAccess checks if a user has access to a channel
func (s *ServerService) HasChannelAccess(channelId, userId string) (bool, error) {
	// Get the server ID for the channel
	var serverId string
	err := s.db.QueryRow(
		"SELECT server_id FROM channels WHERE id = $1",
		channelId,
	).Scan(&serverId)
	if err != nil {
		return false, err
	}

	// Check if user is a member of the server
	isMember, err := s.IsServerMember(serverId, userId)
	if err != nil || !isMember {
		return false, err
	}

	// Check if the channel is private
	var isPrivate bool
	err = s.db.QueryRow(
		"SELECT is_private FROM channels WHERE id = $1",
		channelId,
	).Scan(&isPrivate)
	if err != nil {
		return false, err
	}

	// If the channel is not private, the user has access
	if !isPrivate {
		return true, nil
	}

	// If the channel is private, check if the user is a member of the channel
	var exists bool
	err = s.db.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2)",
		channelId, userId,
	).Scan(&exists)
	return exists, err
}
