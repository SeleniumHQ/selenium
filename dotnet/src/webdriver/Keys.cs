// <copyright file="Keys.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Representations of keys able to be pressed that are not text keys for sending to the browser.
    /// </summary>
    public static class Keys
    {
        /// <summary>
        /// Represents the NUL keystroke.
        /// </summary>
        public static readonly string Null = Convert.ToString(Convert.ToChar(0xE000, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Cancel keystroke.
        /// </summary>
        public static readonly string Cancel = Convert.ToString(Convert.ToChar(0xE001, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Help keystroke.
        /// </summary>
        public static readonly string Help = Convert.ToString(Convert.ToChar(0xE002, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Backspace key.
        /// </summary>
        public static readonly string Backspace = Convert.ToString(Convert.ToChar(0xE003, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Tab key.
        /// </summary>
        public static readonly string Tab = Convert.ToString(Convert.ToChar(0xE004, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Clear keystroke.
        /// </summary>
        public static readonly string Clear = Convert.ToString(Convert.ToChar(0xE005, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Return key.
        /// </summary>
        public static readonly string Return = Convert.ToString(Convert.ToChar(0xE006, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Enter key.
        /// </summary>
        public static readonly string Enter = Convert.ToString(Convert.ToChar(0xE007, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Shift key.
        /// </summary>
        public static readonly string Shift = Convert.ToString(Convert.ToChar(0xE008, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Shift key.
        /// </summary>
        public static readonly string LeftShift = Convert.ToString(Convert.ToChar(0xE008, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the Control key.
        /// </summary>
        public static readonly string Control = Convert.ToString(Convert.ToChar(0xE009, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Control key.
        /// </summary>
        public static readonly string LeftControl = Convert.ToString(Convert.ToChar(0xE009, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the Alt key.
        /// </summary>
        public static readonly string Alt = Convert.ToString(Convert.ToChar(0xE00A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Alt key.
        /// </summary>
        public static readonly string LeftAlt = Convert.ToString(Convert.ToChar(0xE00A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the Pause key.
        /// </summary>
        public static readonly string Pause = Convert.ToString(Convert.ToChar(0xE00B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Escape key.
        /// </summary>
        public static readonly string Escape = Convert.ToString(Convert.ToChar(0xE00C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Spacebar key.
        /// </summary>
        public static readonly string Space = Convert.ToString(Convert.ToChar(0xE00D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Page Up key.
        /// </summary>
        public static readonly string PageUp = Convert.ToString(Convert.ToChar(0xE00E, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Page Down key.
        /// </summary>
        public static readonly string PageDown = Convert.ToString(Convert.ToChar(0xE00F, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the End key.
        /// </summary>
        public static readonly string End = Convert.ToString(Convert.ToChar(0xE010, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Home key.
        /// </summary>
        public static readonly string Home = Convert.ToString(Convert.ToChar(0xE011, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the left arrow key.
        /// </summary>
        public static readonly string Left = Convert.ToString(Convert.ToChar(0xE012, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the left arrow key.
        /// </summary>
        public static readonly string ArrowLeft = Convert.ToString(Convert.ToChar(0xE012, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the up arrow key.
        /// </summary>
        public static readonly string Up = Convert.ToString(Convert.ToChar(0xE013, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the up arrow key.
        /// </summary>
        public static readonly string ArrowUp = Convert.ToString(Convert.ToChar(0xE013, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the right arrow key.
        /// </summary>
        public static readonly string Right = Convert.ToString(Convert.ToChar(0xE014, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the right arrow key.
        /// </summary>
        public static readonly string ArrowRight = Convert.ToString(Convert.ToChar(0xE014, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the Left arrow key.
        /// </summary>
        public static readonly string Down = Convert.ToString(Convert.ToChar(0xE015, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Left arrow key.
        /// </summary>
        public static readonly string ArrowDown = Convert.ToString(Convert.ToChar(0xE015, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture); // alias

        /// <summary>
        /// Represents the Insert key.
        /// </summary>
        public static readonly string Insert = Convert.ToString(Convert.ToChar(0xE016, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the Delete key.
        /// </summary>
        public static readonly string Delete = Convert.ToString(Convert.ToChar(0xE017, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the semi-colon key.
        /// </summary>
        public static readonly string Semicolon = Convert.ToString(Convert.ToChar(0xE018, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the equal sign key.
        /// </summary>
        public static readonly string Equal = Convert.ToString(Convert.ToChar(0xE019, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        // Number pad keys

        /// <summary>
        /// Represents the number pad 0 key.
        /// </summary>
        public static readonly string NumberPad0 = Convert.ToString(Convert.ToChar(0xE01A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 1 key.
        /// </summary>
        public static readonly string NumberPad1 = Convert.ToString(Convert.ToChar(0xE01B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 2 key.
        /// </summary>
        public static readonly string NumberPad2 = Convert.ToString(Convert.ToChar(0xE01C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 3 key.
        /// </summary>
        public static readonly string NumberPad3 = Convert.ToString(Convert.ToChar(0xE01D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 4 key.
        /// </summary>
        public static readonly string NumberPad4 = Convert.ToString(Convert.ToChar(0xE01E, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 5 key.
        /// </summary>
        public static readonly string NumberPad5 = Convert.ToString(Convert.ToChar(0xE01F, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 6 key.
        /// </summary>
        public static readonly string NumberPad6 = Convert.ToString(Convert.ToChar(0xE020, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 7 key.
        /// </summary>
        public static readonly string NumberPad7 = Convert.ToString(Convert.ToChar(0xE021, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 8 key.
        /// </summary>
        public static readonly string NumberPad8 = Convert.ToString(Convert.ToChar(0xE022, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad 9 key.
        /// </summary>
        public static readonly string NumberPad9 = Convert.ToString(Convert.ToChar(0xE023, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad multiplication key.
        /// </summary>
        public static readonly string Multiply = Convert.ToString(Convert.ToChar(0xE024, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad addition key.
        /// </summary>
        public static readonly string Add = Convert.ToString(Convert.ToChar(0xE025, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad thousands separator key.
        /// </summary>
        public static readonly string Separator = Convert.ToString(Convert.ToChar(0xE026, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad subtraction key.
        /// </summary>
        public static readonly string Subtract = Convert.ToString(Convert.ToChar(0xE027, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad decimal separator key.
        /// </summary>
        public static readonly string Decimal = Convert.ToString(Convert.ToChar(0xE028, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the number pad division key.
        /// </summary>
        public static readonly string Divide = Convert.ToString(Convert.ToChar(0xE029, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        // Function keys

        /// <summary>
        /// Represents the function key F1.
        /// </summary>
        public static readonly string F1 = Convert.ToString(Convert.ToChar(0xE031, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F2.
        /// </summary>
        public static readonly string F2 = Convert.ToString(Convert.ToChar(0xE032, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F3.
        /// </summary>
        public static readonly string F3 = Convert.ToString(Convert.ToChar(0xE033, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F4.
        /// </summary>
        public static readonly string F4 = Convert.ToString(Convert.ToChar(0xE034, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F5.
        /// </summary>
        public static readonly string F5 = Convert.ToString(Convert.ToChar(0xE035, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F6.
        /// </summary>
        public static readonly string F6 = Convert.ToString(Convert.ToChar(0xE036, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F7.
        /// </summary>
        public static readonly string F7 = Convert.ToString(Convert.ToChar(0xE037, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F8.
        /// </summary>
        public static readonly string F8 = Convert.ToString(Convert.ToChar(0xE038, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F9.
        /// </summary>
        public static readonly string F9 = Convert.ToString(Convert.ToChar(0xE039, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F10.
        /// </summary>
        public static readonly string F10 = Convert.ToString(Convert.ToChar(0xE03A, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F11.
        /// </summary>
        public static readonly string F11 = Convert.ToString(Convert.ToChar(0xE03B, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key F12.
        /// </summary>
        public static readonly string F12 = Convert.ToString(Convert.ToChar(0xE03C, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key META.
        /// </summary>
        public static readonly string Meta = Convert.ToString(Convert.ToChar(0xE03D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        /// <summary>
        /// Represents the function key COMMAND.
        /// </summary>
        public static readonly string Command = Convert.ToString(Convert.ToChar(0xE03D, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

        private static Dictionary<string, string> descriptions;

        /// <summary>
        /// Gets the description of a specific key.
        /// </summary>
        /// <param name="value">The key value for which to get the description.</param>
        /// <returns>The description of the key.</returns>
        internal static object GetDescription(string value)
        {
            if (descriptions == null)
            {
                descriptions = new Dictionary<string, string>();
                descriptions.Add(Null, "Null");
                descriptions.Add(Cancel, "Cancel");
                descriptions.Add(Help, "Help");
                descriptions.Add(Backspace, "Backspace");
                descriptions.Add(Tab, "Tab");
                descriptions.Add(Clear, "Clear");
                descriptions.Add(Return, "Return");
                descriptions.Add(Enter, "Enter");
                descriptions.Add(Shift, "Shift");
                descriptions.Add(Control, "Control");
                descriptions.Add(Alt, "Alt");
                descriptions.Add(Pause, "Pause");
                descriptions.Add(Escape, "Escape");
                descriptions.Add(Space, "Space");
                descriptions.Add(PageUp, "Page Up");
                descriptions.Add(PageDown, "PageDown");
                descriptions.Add(End, "End");
                descriptions.Add(Home, "Home");
                descriptions.Add(Left, "Left");
                descriptions.Add(Up, "Up");
                descriptions.Add(Right, "Right");
                descriptions.Add(Down, "Down");
                descriptions.Add(Insert, "Insert");
                descriptions.Add(Delete, "Delete");
                descriptions.Add(Semicolon, "Semicolon");
                descriptions.Add(Equal, "Equal");
                descriptions.Add(NumberPad0, "Number Pad 0");
                descriptions.Add(NumberPad1, "Number Pad 1");
                descriptions.Add(NumberPad2, "Number Pad 2");
                descriptions.Add(NumberPad3, "Number Pad 3");
                descriptions.Add(NumberPad4, "Number Pad 4");
                descriptions.Add(NumberPad5, "Number Pad 5");
                descriptions.Add(NumberPad6, "Number Pad 6");
                descriptions.Add(NumberPad7, "Number Pad 7");
                descriptions.Add(NumberPad8, "Number Pad 8");
                descriptions.Add(NumberPad9, "Number Pad 9");
                descriptions.Add(Multiply, "Multiply");
                descriptions.Add(Add, "Add");
                descriptions.Add(Separator, "Separator");
                descriptions.Add(Subtract, "Subtract");
                descriptions.Add(Decimal, "Decimal");
                descriptions.Add(Divide, "Divide");
                descriptions.Add(F1, "F1");
                descriptions.Add(F2, "F2");
                descriptions.Add(F3, "F3");
                descriptions.Add(F4, "F4");
                descriptions.Add(F5, "F5");
                descriptions.Add(F6, "F6");
                descriptions.Add(F7, "F7");
                descriptions.Add(F8, "F8");
                descriptions.Add(F9, "F9");
                descriptions.Add(F10, "F10");
                descriptions.Add(F11, "F11");
                descriptions.Add(F12, "F12");
                descriptions.Add(Meta, "Meta");
                descriptions.Add(Command, "Command");
            }

            if (descriptions.ContainsKey(value))
            {
                return descriptions[value];
            }

            return value;
        }
    }
}
