package utils

import (
	"fmt"
	"github.com/fatih/color"
)

// Logger provides colored logging methods
var Logger = struct {
	Info  func(string)
	Ready func(string)
	Warn  func(string)
	Error func(string)
	Event func(string)
}{
	Info: func(msg string) {
		fmt.Println(color.BlueString("•") + " " + color.HiBlackString("info  - ") + msg)
	},
	Ready: func(msg string) {
		fmt.Println(color.GreenString("•") + " " + color.HiBlackString("ready - ") + msg)
	},
	Warn: func(msg string) {
		fmt.Println(color.YellowString("•") + " " + color.HiBlackString("warn  - ") + msg)
	},
	Error: func(msg string) {
		fmt.Println(color.RedString("•") + " " + color.HiBlackString("error - ") + msg)
	},
	Event: func(msg string) {
		fmt.Println(color.CyanString("•") + " " + color.HiBlackString("event - ") + msg)
	},
}
