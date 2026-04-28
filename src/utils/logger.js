import Color from './color.js'

const getTimestamp = () => {
    return Color.dim(`[${new Date().toLocaleTimeString('id-ID', { hour12: false })}]`)
}

const logger = {
    info: (msg) => console.log(`${getTimestamp()} ${Color.blue('INFO')} ${msg}`),
    done: (msg) => console.log(`${getTimestamp()} ${Color.green('DONE')} ${msg}`),
    warn: (msg) => console.log(`${getTimestamp()} ${Color.yellow('WARN')} ${msg}`),
    error: (msg) => console.log(`${getTimestamp()} ${Color.red('ERR')} ${msg}`),
    ready: (msg) => console.log(`${getTimestamp()} ${Color.cyan('READY')} ${msg}`),
    config: (msg) => console.log(`${getTimestamp()} ${Color.magenta('CONF')} ${msg}`)
}

export default logger
