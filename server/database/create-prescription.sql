CREATE TABLE IF NOT EXISTS `prescriptions` (
    `prescription_id` INTEGER auto_increment,
    `patient_id` INTEGER NOT NULL,
    `doctor_name` VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `notes` TEXT,
    `image_url` VARCHAR(500),
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    PRIMARY KEY (`prescription_id`),
    FOREIGN KEY (`patient_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

GRANT ALL PRIVILEGES ON medicore_db.prescriptions TO 'medicore_app'@'localhost';
FLUSH PRIVILEGES;
