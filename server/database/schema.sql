-- ============================================================================
-- MediCore Healthcare Platform - MySQL Database Schema
-- Version: 1.0
-- Database: medicore_db
-- Description: Complete normalized schema (3NF) for healthcare management
-- ============================================================================

-- Drop database if exists (for fresh installation)
DROP DATABASE IF EXISTS medicore_db;

-- Create database
CREATE DATABASE medicore_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE medicore_db;

-- ============================================================================
-- TABLE: users
-- Description: Stores all user accounts (Patient, Helper, Admin)
-- ============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'helper', 'admin') NOT NULL DEFAULT 'patient',
    
    -- Common profile fields
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    whatsapp VARCHAR(15),
    
    -- Patient-specific fields
    age INT,
    gender ENUM('male', 'female', 'other'),
    prescription_url VARCHAR(500),
    
    -- Helper-specific fields
    specialization VARCHAR(255),
    experience_years INT,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: refresh_tokens
-- Description: Stores JWT refresh tokens for authentication
-- ============================================================================
CREATE TABLE refresh_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: medications
-- Description: Stores medication records for patients
-- ============================================================================
CREATE TABLE medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    
    -- Medication details
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    qty_per_dose INT NOT NULL DEFAULT 1,
    total_quantity INT NOT NULL,
    remaining_quantity INT NOT NULL,
    
    -- Timing
    meal_type ENUM('before_meal', 'after_meal', 'with_meal', 'empty_stomach') NOT NULL,
    scheduled_times JSON NOT NULL, -- Array of times: ["08:00", "14:00", "20:00"]
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Additional info
    remarks TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_patient (patient_id),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: appointments
-- Description: Stores doctor appointment records
-- ============================================================================
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    
    -- Appointment details
    doctor_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    
    -- Location
    hospital_name VARCHAR(255),
    address TEXT,
    contact_number VARCHAR(15),
    
    -- Status
    status ENUM('scheduled', 'completed', 'cancelled', 'missed') DEFAULT 'scheduled',
    
    -- Additional info
    reason TEXT,
    remarks TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_patient (patient_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_reminder (reminder_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: medication_logs
-- Description: Tracks medication adherence (when patient takes medicine)
-- ============================================================================
CREATE TABLE medication_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT NOT NULL,
    patient_id INT NOT NULL,
    
    -- Timing details
    scheduled_time TIME NOT NULL,
    taken_time TIMESTAMP NOT NULL,
    delay_minutes INT DEFAULT 0, -- Positive = late, Negative = early
    
    -- Status
    status ENUM('on_time', 'late', 'early', 'missed', 'skipped') NOT NULL,
    
    -- Additional info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (medication_id) REFERENCES medications(medication_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_medication (medication_id),
    INDEX idx_patient (patient_id),
    INDEX idx_status (status),
    INDEX idx_taken_time (taken_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: patient_helpers
-- Description: Maps helpers to patients (many-to-many relationship)
-- ============================================================================
CREATE TABLE patient_helpers (
    relationship_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    helper_id INT NOT NULL,
    
    -- Relationship details
    assigned_by INT, -- Admin who assigned
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Permissions
    can_view_medications BOOLEAN DEFAULT TRUE,
    can_view_appointments BOOLEAN DEFAULT TRUE,
    can_view_logs BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (helper_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Unique constraint (one helper-patient pair)
    UNIQUE KEY unique_patient_helper (patient_id, helper_id),
    
    -- Indexes
    INDEX idx_patient (patient_id),
    INDEX idx_helper (helper_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: notifications
-- Description: Stores notification history
-- ============================================================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Notification details
    type ENUM('medication_reminder', 'appointment_reminder', 'low_stock', 'helper_assigned', 'welcome') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    medication_id INT NULL,
    appointment_id INT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(medication_id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: system_logs
-- Description: Audit trail for system activities
-- ============================================================================
CREATE TABLE system_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    
    -- Activity details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    
    -- Request details
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Additional data
    details JSON,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA: Create default admin account
-- ============================================================================
INSERT INTO users (
    email, 
    password_hash, 
    role, 
    full_name, 
    mobile, 
    is_active, 
    is_verified
) VALUES (
    'admin@medicore.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIgNW2G', -- password: Admin@123
    'admin',
    'System Administrator',
    '9999999999',
    TRUE,
    TRUE
);

-- ============================================================================
-- VIEWS: Pre-computed queries for analytics
-- ============================================================================

-- View: Patient medication adherence summary
CREATE VIEW patient_adherence_summary AS
SELECT 
    u.user_id,
    u.full_name,
    COUNT(DISTINCT m.medication_id) as total_medications,
    COUNT(ml.log_id) as total_doses_taken,
    SUM(CASE WHEN ml.status = 'on_time' THEN 1 ELSE 0 END) as on_time_count,
    SUM(CASE WHEN ml.status = 'late' THEN 1 ELSE 0 END) as late_count,
    SUM(CASE WHEN ml.status = 'missed' THEN 1 ELSE 0 END) as missed_count,
    ROUND(
        (SUM(CASE WHEN ml.status = 'on_time' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(COUNT(ml.log_id), 0), 
        2
    ) as adherence_percentage
FROM users u
LEFT JOIN medications m ON u.user_id = m.patient_id AND m.is_active = TRUE
LEFT JOIN medication_logs ml ON m.medication_id = ml.medication_id
WHERE u.role = 'patient'
GROUP BY u.user_id, u.full_name;

-- View: Upcoming appointments
CREATE VIEW upcoming_appointments AS
SELECT 
    a.appointment_id,
    a.patient_id,
    u.full_name as patient_name,
    a.doctor_name,
    a.appointment_date,
    a.appointment_time,
    a.hospital_name,
    a.status,
    DATEDIFF(a.appointment_date, CURDATE()) as days_until
FROM appointments a
JOIN users u ON a.patient_id = u.user_id
WHERE a.status = 'scheduled' 
  AND a.appointment_date >= CURDATE()
ORDER BY a.appointment_date, a.appointment_time;

-- View: Active medications with low stock
CREATE VIEW low_stock_medications AS
SELECT 
    m.medication_id,
    m.patient_id,
    u.full_name as patient_name,
    u.email,
    m.medicine_name,
    m.remaining_quantity,
    m.qty_per_dose,
    FLOOR(m.remaining_quantity / m.qty_per_dose) as days_remaining
FROM medications m
JOIN users u ON m.patient_id = u.user_id
WHERE m.is_active = TRUE 
  AND m.remaining_quantity <= (m.qty_per_dose * 3) -- Less than 3 days
ORDER BY m.remaining_quantity ASC;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Mark medication as taken
DELIMITER //
CREATE PROCEDURE mark_medication_taken(
    IN p_medication_id INT,
    IN p_patient_id INT,
    IN p_scheduled_time TIME,
    IN p_taken_time TIMESTAMP
)
BEGIN
    DECLARE v_delay_minutes INT;
    DECLARE v_status VARCHAR(20);
    
    -- Calculate delay
    SET v_delay_minutes = TIMESTAMPDIFF(MINUTE, 
        CONCAT(CURDATE(), ' ', p_scheduled_time), 
        p_taken_time
    );
    
    -- Determine status
    IF v_delay_minutes BETWEEN -15 AND 15 THEN
        SET v_status = 'on_time';
    ELSEIF v_delay_minutes > 15 THEN
        SET v_status = 'late';
    ELSE
        SET v_status = 'early';
    END IF;
    
    -- Insert log
    INSERT INTO medication_logs (
        medication_id, 
        patient_id, 
        scheduled_time, 
        taken_time, 
        delay_minutes, 
        status
    ) VALUES (
        p_medication_id, 
        p_patient_id, 
        p_scheduled_time, 
        p_taken_time, 
        v_delay_minutes, 
        v_status
    );
    
    -- Update remaining quantity
    UPDATE medications 
    SET remaining_quantity = remaining_quantity - qty_per_dose
    WHERE medication_id = p_medication_id;
    
END //
DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-deactivate expired medications
DELIMITER //
CREATE TRIGGER deactivate_expired_medications
BEFORE UPDATE ON medications
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() THEN
        SET NEW.is_active = FALSE;
    END IF;
END //
DELIMITER ;

-- Trigger: Auto-update appointment status
DELIMITER //
CREATE TRIGGER update_missed_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() AND NEW.status = 'scheduled' THEN
        SET NEW.status = 'missed';
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_med_patient_active ON medications(patient_id, is_active);
CREATE INDEX idx_apt_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_log_patient_time ON medication_logs(patient_id, taken_time);

-- ============================================================================
-- GRANT PERMISSIONS (for application user)
-- ============================================================================

-- Create application user
CREATE USER IF NOT EXISTS 'medicore_app'@'localhost' IDENTIFIED BY 'MediCore@2026';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON medicore_db.* TO 'medicore_app'@'localhost';
GRANT EXECUTE ON medicore_db.* TO 'medicore_app'@'localhost';

FLUSH PRIVILEGES;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
