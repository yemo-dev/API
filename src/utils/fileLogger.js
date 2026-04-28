import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGS_DIR = path.join(process.cwd(), 'logs')

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
}

const getTodayFile = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}.log`
}

const fileLogger = {
    write: (level, message, metadata = {}) => {
        const now = new Date()
        const timestamp = now.toISOString()
        const logFile = path.join(LOGS_DIR, getTodayFile())
        
        const logEntry = {
            timestamp,
            level,
            message,
            ...metadata
        }

        // Clean message from ANSI colors if any (though we shouldn't send colors to file)
        const cleanMessage = typeof message === 'string' ? message.replace(/\x1b\[[0-9;]*m/g, '') : message

        const line = `[${timestamp}] [${level.toUpperCase()}] ${cleanMessage} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}\n`
        
        fs.appendFile(logFile, line, (err) => {
            if (err) console.error('Failed to write to log file:', err)
        })
    },

    listLogs: () => {
        if (!fs.existsSync(LOGS_DIR)) return []
        return fs.readdirSync(LOGS_DIR)
            .filter(file => file.endsWith('.log'))
            .sort((a, b) => b.localeCompare(a))
    },

    readLog: (filename) => {
        const filePath = path.join(LOGS_DIR, filename)
        if (!fs.existsSync(filePath)) return null
        return fs.readFileSync(filePath, 'utf8')
    },

    deleteLog: (filename) => {
        const filePath = path.join(LOGS_DIR, filename)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            return true
        }
        return false
    }
}

export default fileLogger
