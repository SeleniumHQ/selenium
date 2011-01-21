using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    internal class SendKeysAction : KeyboardAction, IAction
    {
        private string keysToSend;

        public SendKeysAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string keysToSend)
            : base(keyboard, mouse, actionTarget)
        {
            this.keysToSend = keysToSend;
        }

        #region IAction Members

        public void Perform()
        {
            this.FocusOnElement();
            this.Keyboard.SendKeys(this.keysToSend);
        }

        #endregion
    }
}
