package utils

import "github.com/fatih/color"

// Re-export color for convenience if needed, though usually direct import is fine.
// We keep this to match the structure if necessary, but Logger handles most things.
// The JS version exported a color object.
var Color = color.New
