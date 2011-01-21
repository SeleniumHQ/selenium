using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    internal class KeyboardAction : WebDriverAction
    {
        private IKeyboard keyboard;
        private IMouse mouse;

        protected KeyboardAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget)
            : base(actionTarget)
        {
            this.keyboard = keyboard;
            this.mouse = mouse;
        }

        protected void FocusOnElement()
        {
            if (this.ActionTarget != null)
            {
                mouse.Click(ActionTarget.Coordinates);
            }
        }

        protected IKeyboard Keyboard
        {
            get { return this.keyboard; }
        }

        protected IMouse Mouse
        {
            get { return this.mouse; }
        }
    }
}
