-- Add selected_days column to medications table
-- Run this with: mysql -u root -p < add_selected_days_column.sql

USE medicore_db;

-- Add the column if it doesn't exist
ALTER TABLE medications 
ADD COLUMN IF NOT EXISTS selected_days JSON DEFAULT NULL 
COMMENT 'Array of days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]' 
AFTER scheduled_times;

-- Verify the column was added
DESCRIBE medications;

SELECT 'Column added successfully!' as Status;
