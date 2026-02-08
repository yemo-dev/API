import Color from './color.js'

const logger = {
    info: (msg) => console.log(`${Color.blue('○')} ${Color.gray('info')}  ${msg}`),
    ready: (msg) => console.log(`${Color.green('●')} ${Color.gray('ready')} ${msg}`),
    warn: (msg) => console.log(`${Color.yellow('○')} ${Color.gray('warn')}  ${msg}`),
    error: (msg) => console.error(`${Color.red('●')} ${Color.gray('error')} ${msg}`),
}

export default logger
