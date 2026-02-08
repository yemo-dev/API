const colors = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39],
    },
}

const Color = {}

Object.keys(colors.color).forEach((name) => {
    const [start, end] = colors.color[name]
    Color[name] = (text) => `\x1b[${start}m${text}\x1b[${end}m`
})

Color.bold = (text) => `\x1b[${colors.bold[0]}m${text}\x1b[${colors.bold[1]}m`
Color.dim = (text) => `\x1b[${colors.dim[0]}m${text}\x1b[${colors.dim[1]}m`

export default Color
