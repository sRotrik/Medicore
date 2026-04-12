const mysql = require('mysql2/promise');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root', // default for Windows XAMPP
            database: 'medicore_db'
        });
        
        console.log('Connected to MySQL as root');
        
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`prescriptions\` (
                \`prescription_id\` INTEGER auto_increment,
                \`patient_id\` INTEGER NOT NULL,
                \`doctor_name\` VARCHAR(255) NOT NULL,
                \`date\` DATE NOT NULL,
                \`title\` VARCHAR(255) NOT NULL,
                \`notes\` TEXT,
                \`image_url\` VARCHAR(500),
                \`created_at\` DATETIME NOT NULL,
                \`updated_at\` DATETIME NOT NULL,
                PRIMARY KEY (\`prescription_id\`),
                FOREIGN KEY (\`patient_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);
        
        await connection.execute(`GRANT ALL PRIVILEGES ON medicore_db.prescriptions TO 'medicore_app'@'localhost';`);
        await connection.execute(`FLUSH PRIVILEGES;`);
        
        console.log('Table created successfully');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
