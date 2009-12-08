using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public static class Keys
    {
        public static readonly string Null = Convert.ToString(Convert.ToChar(0xE000));
        public static readonly string Cancel = Convert.ToString(Convert.ToChar(0xE001));
        public static readonly string Help = Convert.ToString(Convert.ToChar(0xE002));
        public static readonly string Backspace = Convert.ToString(Convert.ToChar(0xE003));
        public static readonly string Tab = Convert.ToString(Convert.ToChar(0xE004));
        public static readonly string Clear = Convert.ToString(Convert.ToChar(0xE005));
        public static readonly string Return = Convert.ToString(Convert.ToChar(0xE006));
        public static readonly string Enter = Convert.ToString(Convert.ToChar(0xE007));
        public static readonly string Shift = Convert.ToString(Convert.ToChar(0xE008));
        public static readonly string LeftShift = Convert.ToString(Convert.ToChar(0xE008)); // alias
        public static readonly string Control = Convert.ToString(Convert.ToChar(0xE009));
        public static readonly string LeftControl = Convert.ToString(Convert.ToChar(0xE009)); // alias
        public static readonly string Alt = Convert.ToString(Convert.ToChar(0xE00A));
        public static readonly string LeftAlt = Convert.ToString(Convert.ToChar(0xE00A)); // alias
        public static readonly string Pause = Convert.ToString(Convert.ToChar(0xE00B));
        public static readonly string Escape = Convert.ToString(Convert.ToChar(0xE00C));
        public static readonly string Space = Convert.ToString(Convert.ToChar(0xE00D));
        public static readonly string PageUp = Convert.ToString(Convert.ToChar(0xE00E));
        public static readonly string PageDown = Convert.ToString(Convert.ToChar(0xE00F));
        public static readonly string End = Convert.ToString(Convert.ToChar(0xE010));
        public static readonly string Home = Convert.ToString(Convert.ToChar(0xE011));
        public static readonly string Left = Convert.ToString(Convert.ToChar(0xE012));
        public static readonly string ArrowLeft = Convert.ToString(Convert.ToChar(0xE012)); // alias
        public static readonly string Up = Convert.ToString(Convert.ToChar(0xE013));
        public static readonly string ArrowUp = Convert.ToString(Convert.ToChar(0xE013)); // alias
        public static readonly string Right = Convert.ToString(Convert.ToChar(0xE014));
        public static readonly string ArrowRight = Convert.ToString(Convert.ToChar(0xE014)); // alias
        public static readonly string Down = Convert.ToString(Convert.ToChar(0xE015));
        public static readonly string ArrowDown = Convert.ToString(Convert.ToChar(0xE015)); // alias
        public static readonly string Insert = Convert.ToString(Convert.ToChar(0xE016));
        public static readonly string Delete = Convert.ToString(Convert.ToChar(0xE017));
        public static readonly string Semicolon = Convert.ToString(Convert.ToChar(0xE018));
        public static readonly string Equals = Convert.ToString(Convert.ToChar(0xE019));

        // Number pad keys
        public static readonly string NumPad0 = Convert.ToString(Convert.ToChar(0xE01A));
        public static readonly string NumPad1 = Convert.ToString(Convert.ToChar(0xE01B));
        public static readonly string NumPad2 = Convert.ToString(Convert.ToChar(0xE01C));
        public static readonly string NumPad3 = Convert.ToString(Convert.ToChar(0xE01D));
        public static readonly string NumPad4 = Convert.ToString(Convert.ToChar(0xE01E));
        public static readonly string NumPad5 = Convert.ToString(Convert.ToChar(0xE01F));
        public static readonly string NumPad6 = Convert.ToString(Convert.ToChar(0xE020));
        public static readonly string NumPad7 = Convert.ToString(Convert.ToChar(0xE021));
        public static readonly string NumPad8 = Convert.ToString(Convert.ToChar(0xE022));
        public static readonly string NumPad9 = Convert.ToString(Convert.ToChar(0xE023));
        public static readonly string Multiply = Convert.ToString(Convert.ToChar(0xE024));
        public static readonly string Add = Convert.ToString(Convert.ToChar(0xE025));
        public static readonly string Separator = Convert.ToString(Convert.ToChar(0xE026));
        public static readonly string Subtract = Convert.ToString(Convert.ToChar(0xE027));
        public static readonly string Decimal = Convert.ToString(Convert.ToChar(0xE028));
        public static readonly string Divide = Convert.ToString(Convert.ToChar(0xE029));

        // Function keys
        public static readonly string F1 = Convert.ToString(Convert.ToChar(0xE031));
        public static readonly string F2 = Convert.ToString(Convert.ToChar(0xE032));
        public static readonly string F3 = Convert.ToString(Convert.ToChar(0xE033));
        public static readonly string F4 = Convert.ToString(Convert.ToChar(0xE034));
        public static readonly string F5 = Convert.ToString(Convert.ToChar(0xE035));
        public static readonly string F6 = Convert.ToString(Convert.ToChar(0xE036));
        public static readonly string F7 = Convert.ToString(Convert.ToChar(0xE037));
        public static readonly string F8 = Convert.ToString(Convert.ToChar(0xE038));
        public static readonly string F9 = Convert.ToString(Convert.ToChar(0xE039));
        public static readonly string F10 = Convert.ToString(Convert.ToChar(0xE03A));
        public static readonly string F11 = Convert.ToString(Convert.ToChar(0xE03B));
        public static readonly string F12 = Convert.ToString(Convert.ToChar(0xE03C));
    }
}
