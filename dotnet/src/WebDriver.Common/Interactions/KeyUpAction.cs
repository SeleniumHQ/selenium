using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class KeyUpAction : SingleKeyAction, IAction
    {
        public KeyUpAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string key)
            : base(keyboard, mouse, actionTarget, key)
        {
        }

        public KeyUpAction(IKeyboard keyboard, IMouse mouse, string key)
            : base(keyboard, mouse, key)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.FocusOnElement();
            this.Keyboard.ReleaseKey(this.Key);
        }

        #endregion
    }
}
