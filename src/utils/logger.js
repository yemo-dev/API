import Color from './color.js'

const getTimestamp = () => {
    return Color.dim(`[${new Date().toLocaleTimeString('id-ID', { hour12: false })}]`)
}

const logger = {
    info: (msg) => console.log(`${getTimestamp()} ${Color.blue('●')} ${msg}`),
    success: (msg) => console.log(`${getTimestamp()} ${Color.green('✓')} ${msg}`),
    warn: (msg) => console.log(`${getTimestamp()} ${Color.yellow('⚠️')} ${msg}`),
    error: (msg) => console.log(`${getTimestamp()} ${Color.red('✖')} ${msg}`),
    ready: (msg) => console.log(`${getTimestamp()} ${Color.cyan('●')} ${Color.bold('ready')} ${msg}`)
}

export default logger
