
CREATE DATABASE IF NOT EXISTS whatsapp_chatbot;
USE whatsapp_chatbot;


CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_phone VARCHAR(20) NOT NULL,
    message_type ENUM('user', 'bot') NOT NULL,
    message_text TEXT NOT NULL,
    message_category ENUM(
        'welcome',
        'menu',
        'confirmation',
        'error',
        'farewell',
        'engagement',
        'validation',
        'alert',
        'summary',
        'general'
    ) DEFAULT 'general',
    intent VARCHAR(100),
    confidence_score DECIMAL(3,2),
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_user_phone (user_phone),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);


CREATE TABLE IF NOT EXISTS chatbot_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_phone VARCHAR(20) NOT NULL,
    session_id VARCHAR(100),
    rating INT,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_phone (user_phone),
    INDEX idx_rating (rating)
);


CREATE TABLE IF NOT EXISTS chatbot_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    user_phone VARCHAR(20) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'closed') DEFAULT 'active',
    INDEX idx_user_phone (user_phone),
    INDEX idx_status (status)
);