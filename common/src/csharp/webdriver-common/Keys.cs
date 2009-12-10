using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;

namespace OpenQA.Selenium
{
    public static class Keys
    {
        public static readonly string Null = Convert.ToString(Convert.ToChar(0xE000, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Cancel = Convert.ToString(Convert.ToChar(0xE001, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Help = Convert.ToString(Convert.ToChar(0xE002, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Backspace = Convert.ToString(Convert.ToChar(0xE003, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Tab = Convert.ToString(Convert.ToChar(0xE004, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Clear = Convert.ToString(Convert.ToChar(0xE005, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Return = Convert.ToString(Convert.ToChar(0xE006, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Enter = Convert.ToString(Convert.ToChar(0xE007, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Shift = Convert.ToString(Convert.ToChar(0xE008, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string LeftShift = Convert.ToString(Convert.ToChar(0xE008, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Control = Convert.ToString(Convert.ToChar(0xE009, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string LeftControl = Convert.ToString(Convert.ToChar(0xE009, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Alt = Convert.ToString(Convert.ToChar(0xE00A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string LeftAlt = Convert.ToString(Convert.ToChar(0xE00A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Pause = Convert.ToString(Convert.ToChar(0xE00B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Escape = Convert.ToString(Convert.ToChar(0xE00C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Space = Convert.ToString(Convert.ToChar(0xE00D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string PageUp = Convert.ToString(Convert.ToChar(0xE00E, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string PageDown = Convert.ToString(Convert.ToChar(0xE00F, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string End = Convert.ToString(Convert.ToChar(0xE010, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Home = Convert.ToString(Convert.ToChar(0xE011, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Left = Convert.ToString(Convert.ToChar(0xE012, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string ArrowLeft = Convert.ToString(Convert.ToChar(0xE012, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Up = Convert.ToString(Convert.ToChar(0xE013, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string ArrowUp = Convert.ToString(Convert.ToChar(0xE013, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Right = Convert.ToString(Convert.ToChar(0xE014, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string ArrowRight = Convert.ToString(Convert.ToChar(0xE014, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Down = Convert.ToString(Convert.ToChar(0xE015, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string ArrowDown = Convert.ToString(Convert.ToChar(0xE015, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias
        public static readonly string Insert = Convert.ToString(Convert.ToChar(0xE016, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Delete = Convert.ToString(Convert.ToChar(0xE017, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Semicolon = Convert.ToString(Convert.ToChar(0xE018, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Equal = Convert.ToString(Convert.ToChar(0xE019, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        // Number pad keys
        public static readonly string NumberPad0 = Convert.ToString(Convert.ToChar(0xE01A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad1 = Convert.ToString(Convert.ToChar(0xE01B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad2 = Convert.ToString(Convert.ToChar(0xE01C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad3 = Convert.ToString(Convert.ToChar(0xE01D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad4 = Convert.ToString(Convert.ToChar(0xE01E, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad5 = Convert.ToString(Convert.ToChar(0xE01F, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad6 = Convert.ToString(Convert.ToChar(0xE020, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad7 = Convert.ToString(Convert.ToChar(0xE021, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad8 = Convert.ToString(Convert.ToChar(0xE022, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string NumberPad9 = Convert.ToString(Convert.ToChar(0xE023, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Multiply = Convert.ToString(Convert.ToChar(0xE024, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Add = Convert.ToString(Convert.ToChar(0xE025, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Separator = Convert.ToString(Convert.ToChar(0xE026, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Subtract = Convert.ToString(Convert.ToChar(0xE027, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Decimal = Convert.ToString(Convert.ToChar(0xE028, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string Divide = Convert.ToString(Convert.ToChar(0xE029, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        // Function keys
        public static readonly string F1 = Convert.ToString(Convert.ToChar(0xE031, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F2 = Convert.ToString(Convert.ToChar(0xE032, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F3 = Convert.ToString(Convert.ToChar(0xE033, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F4 = Convert.ToString(Convert.ToChar(0xE034, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F5 = Convert.ToString(Convert.ToChar(0xE035, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F6 = Convert.ToString(Convert.ToChar(0xE036, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F7 = Convert.ToString(Convert.ToChar(0xE037, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F8 = Convert.ToString(Convert.ToChar(0xE038, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F9 = Convert.ToString(Convert.ToChar(0xE039, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F10 = Convert.ToString(Convert.ToChar(0xE03A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F11 = Convert.ToString(Convert.ToChar(0xE03B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
        public static readonly string F12 = Convert.ToString(Convert.ToChar(0xE03C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
    }
}
