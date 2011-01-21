using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    internal class KeyDownAction : SingleKeyAction, IAction
    {
        public KeyDownAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string key)
            : base(keyboard, mouse, actionTarget, key)
        {
        }

        public KeyDownAction(IKeyboard keyboard, IMouse mouse, string key)
            : base(keyboard, mouse, key)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.FocusOnElement();
            this.Keyboard.PressKey(this.Key);
        }

        #endregion
    }
}
