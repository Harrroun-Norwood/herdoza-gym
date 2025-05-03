const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Simple logger function
const logger = {
    error: (message, error) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ERROR: ${message} ${error ? '- ' + error.stack : ''}\n`;
        
        // Log to console
        console.error(logMessage);
        
        // Log to file
        fs.appendFile(
            path.join(logsDir, 'error.log'),
            logMessage,
            (err) => {
                if (err) console.error('Error writing to log file:', err);
            }
        );
    },

    info: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] INFO: ${message}\n`;
        
        // Log to console
        console.log(logMessage);
        
        // Log to file
        fs.appendFile(
            path.join(logsDir, 'info.log'),
            logMessage,
            (err) => {
                if (err) console.error('Error writing to log file:', err);
            }
        );
    }
};

module.exports = logger; 