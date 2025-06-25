-- Authentication & Authorization Database Schema for MySQL
-- This schema provides comprehensive user management, role-based access control, and session handling

-- Create database
CREATE DATABASE IF NOT EXISTS auth_system;
USE auth_system;

-- Users table - stores basic user information
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_locked (locked_until)
);

-- Roles table - defines available roles in the system
CREATE TABLE roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Permissions table - defines granular permissions
CREATE TABLE permissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_name (name),
    INDEX idx_resource_action (resource, action),
    INDEX idx_active (is_active)
);

-- User roles junction table - many-to-many relationship between users and roles
CREATE TABLE user_roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_role_active (role_id, is_active),
    INDEX idx_expires (expires_at)
);

-- Role permissions junction table - many-to-many relationship between roles and permissions
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    granted_by BIGINT UNSIGNED,
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_active (role_id, is_active),
    INDEX idx_permission_active (permission_id, is_active)
);

-- User sessions table - tracks active user sessions
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_refresh_token (refresh_token),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_expires (expires_at),
    INDEX idx_last_accessed (last_accessed)
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_unused (user_id, used_at),
    INDEX idx_expires (expires_at)
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_unused (user_id, used_at),
    INDEX idx_expires (expires_at)
);

-- Audit log table - tracks important authentication/authorization events
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT UNSIGNED,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_action_created (action, created_at),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created (created_at)
);

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'Super Administrator', 'Has full system access and can manage all users and permissions'),
('admin', 'Administrator', 'Can manage users and most system settings'),
('moderator', 'Moderator', 'Can moderate content and manage basic user interactions'),
('user', 'Regular User', 'Standard user with basic permissions'),
('guest', 'Guest User', 'Limited access for unregistered users');

-- Insert common permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- User management permissions
('users.create', 'Create Users', 'Can create new user accounts', 'users', 'create'),
('users.read', 'View Users', 'Can view user information', 'users', 'read'),
('users.update', 'Update Users', 'Can modify user information', 'users', 'update'),
('users.delete', 'Delete Users', 'Can delete user accounts', 'users', 'delete'),
('users.manage_roles', 'Manage User Roles', 'Can assign/remove roles from users', 'users', 'manage_roles'),

-- Role management permissions
('roles.create', 'Create Roles', 'Can create new roles', 'roles', 'create'),
('roles.read', 'View Roles', 'Can view role information', 'roles', 'read'),
('roles.update', 'Update Roles', 'Can modify role information', 'roles', 'update'),
('roles.delete', 'Delete Roles', 'Can delete roles', 'roles', 'delete'),
('roles.manage_permissions', 'Manage Role Permissions', 'Can assign/remove permissions from roles', 'roles', 'manage_permissions'),

-- System permissions
('system.admin', 'System Administration', 'Full system administration access', 'system', 'admin'),
('system.settings', 'System Settings', 'Can modify system settings', 'system', 'settings'),
('system.audit', 'View Audit Logs', 'Can view system audit logs', 'system', 'audit'),

-- Content permissions (example)
('content.create', 'Create Content', 'Can create new content', 'content', 'create'),
('content.read', 'View Content', 'Can view content', 'content', 'read'),
('content.update', 'Update Content', 'Can modify content', 'content', 'update'),
('content.delete', 'Delete Content', 'Can delete content', 'content', 'delete'),
('content.moderate', 'Moderate Content', 'Can moderate user-generated content', 'content', 'moderate');

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'super_admin';

-- Admin gets most permissions except super admin functions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'admin' 
AND p.name NOT IN ('system.admin');

-- Moderator gets content and basic user permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'moderator' 
AND p.name IN ('users.read', 'content.create', 'content.read', 'content.update', 'content.moderate');

-- Regular user gets basic content permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'user' 
AND p.name IN ('content.create', 'content.read', 'content.update');

-- Guest gets only read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'guest' 
AND p.name IN ('content.read');

-- Useful views for common queries
-- View to get user permissions (including inherited from roles)
CREATE VIEW user_permissions AS
SELECT DISTINCT
    u.id as user_id,
    u.username,
    p.id as permission_id,
    p.name as permission_name,
    p.resource,
    p.action,
    'role' as permission_source,
    r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
JOIN roles r ON ur.role_id = r.id AND r.is_active = TRUE
JOIN role_permissions rp ON r.id = rp.role_id AND rp.is_active = TRUE
JOIN permissions p ON rp.permission_id = p.id AND p.is_active = TRUE
WHERE u.is_active = TRUE;

-- View to get active user sessions
CREATE VIEW active_user_sessions AS
SELECT 
    s.id as session_id,
    s.user_id,
    u.username,
    u.email,
    s.session_token,
    s.ip_address,
    s.expires_at,
    s.last_accessed,
    s.created_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE 
AND s.expires_at > NOW()
AND u.is_active = TRUE;

-- Stored procedures for common operations

-- Procedure to authenticate user
DELIMITER //
CREATE PROCEDURE AuthenticateUser(
    IN p_username VARCHAR(50),
    IN p_password_hash VARCHAR(255),
    OUT p_user_id BIGINT,
    OUT p_is_locked BOOLEAN,
    OUT p_is_active BOOLEAN
)
BEGIN
    DECLARE v_failed_attempts INT DEFAULT 0;
    DECLARE v_locked_until TIMESTAMP;
    
    SELECT 
        id,
        failed_login_attempts,
        locked_until,
        is_active,
        CASE 
            WHEN locked_until IS NOT NULL AND locked_until > NOW() THEN TRUE
            ELSE FALSE
        END as is_currently_locked
    INTO 
        p_user_id,
        v_failed_attempts,
        v_locked_until,
        p_is_active,
        p_is_locked
    FROM users 
    WHERE (username = p_username OR email = p_username)
    AND password_hash = p_password_hash;
    
    IF p_user_id IS NOT NULL AND NOT p_is_locked AND p_is_active THEN
        -- Successful login - reset failed attempts and update last login
        UPDATE users 
        SET 
            failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW()
        WHERE id = p_user_id;
    END IF;
END //
DELIMITER ;

-- Procedure to check user permission
DELIMITER //
CREATE PROCEDURE CheckUserPermission(
    IN p_user_id BIGINT,
    IN p_permission_name VARCHAR(100),
    OUT p_has_permission BOOLEAN
)
BEGIN
    SELECT COUNT(*) > 0 INTO p_has_permission
    FROM user_permissions
    WHERE user_id = p_user_id 
    AND permission_name = p_permission_name;
END //
DELIMITER ;