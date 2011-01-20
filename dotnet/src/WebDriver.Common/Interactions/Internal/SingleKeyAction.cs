using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    public class SingleKeyAction : KeyboardAction
    {
        private static readonly List<string> modifierKeys = new List<string>() { Keys.Shift, Keys.Control, Keys.Alt };
        string key;

        protected SingleKeyAction(IKeyboard keyboard, IMouse mouse, string key)
            : this(keyboard, mouse, null, key)
        {
        }

        protected SingleKeyAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string key)
            : base(keyboard, mouse, actionTarget)
        {
            if (!modifierKeys.Contains(key))
            {
                throw new ArgumentException("key must be a modifier key (Keys.Shift, Keys.Control, or Keys.Alt)", "key");
            }

            this.key = key;
        }

        protected string Key
        {
            get { return this.key; }
        }
    }
}
