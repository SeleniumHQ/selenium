using System;
using System.Collections.Generic;

using System.Text;

namespace OpenQA.Selenium.Interactions
{
    public class DefaultActionSequenceBuilder : IActionSequenceBuilder
    {
        private IKeyboard keyboard;
        private IMouse mouse;
        private CompositeAction action = new CompositeAction();

        public DefaultActionSequenceBuilder(IWebDriver driver)
        {
            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            if (inputDevicesDriver != null)
            {
                keyboard = inputDevicesDriver.Keyboard;
                mouse = inputDevicesDriver.Mouse;
            }
        }

        #region IActionSequenceGenerator Members

        public IActionSequenceBuilder KeyDown(string theKey)
        {
            return this.KeyDown(null, theKey);
        }

        public IActionSequenceBuilder KeyDown(IWebElement element, string theKey)
        {
            if (!Keys.IsKey(theKey))
            {
                throw new ArgumentException("Key to be sent must be one of the Keys class", "theKey");
            }

            ILocatable target = element as ILocatable;
            action.AddAction(new KeyDownAction(this.keyboard, this.mouse, target, theKey));
            return this;
        }

        public IActionSequenceBuilder KeyUp(string theKey)
        {
            return this.KeyUp(null, theKey);
        }

        public IActionSequenceBuilder KeyUp(IWebElement element, string theKey)
        {
            if (!Keys.IsKey(theKey))
            {
                throw new ArgumentException("Key to be sent must be one of the Keys class", "theKey");
            }

            ILocatable target = element as ILocatable;
            action.AddAction(new KeyUpAction(this.keyboard, this.mouse, target, theKey));
            return this;
        }

        public IActionSequenceBuilder SendKeys(string keysToSend)
        {
            return this.SendKeys(null, keysToSend);
        }

        public IActionSequenceBuilder SendKeys(IWebElement element, string keysToSend)
        {
            ILocatable target = element as ILocatable;
            action.AddAction(new SendKeysAction(this.keyboard, this.mouse, target, keysToSend));
            return this;
        }

        public IActionSequenceBuilder ClickAndHold(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ClickAndHoldAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder Release(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ButtonReleaseAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder Click(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ClickAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder Click()
        {
            return this.Click(null);
        }

        public IActionSequenceBuilder DoubleClick(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new DoubleClickAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder MoveToElement(IWebElement toElement)
        {
            ILocatable target = toElement as ILocatable;
            action.AddAction(new MoveMouseAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder MoveToElement(IWebElement toElement, int xOffset, int yOffset)
        {
            ILocatable target = toElement as ILocatable;
            action.AddAction(new MoveToOffsetAction(this.mouse, target, xOffset, yOffset));
            return this;
        }

        public IActionSequenceBuilder MoveByOffset(int xOffset, int yOffset)
        {
            return this.MoveToElement(null, xOffset, yOffset);
        }

        public IActionSequenceBuilder ContextClick(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ContextClickAction(this.mouse, target));
            return this;
        }

        public IActionSequenceBuilder DragAndDrop(IWebElement source, IWebElement target)
        {
            ILocatable startElement = source as ILocatable;
            ILocatable endElement = target as ILocatable;

            action.AddAction(new ClickAndHoldAction(this.mouse, startElement));
            action.AddAction(new MoveMouseAction(this.mouse, endElement));
            action.AddAction(new ButtonReleaseAction(this.mouse, endElement));
            return this;
        }

        public IAction Build()
        {
            CompositeAction toReturn = action;
            action = null;
            return toReturn;
        }

        #endregion
    }
}
