using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Provides a mechanism for building advanced interactions with the browser.
    /// </summary>
    public class DefaultActionSequenceBuilder : IActionSequenceBuilder
    {
        private IKeyboard keyboard;
        private IMouse mouse;
        private CompositeAction action = new CompositeAction();

        /// <summary>
        /// Initializes a new instance of the <see cref="DefaultActionSequenceBuilder"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
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
        /// <summary>
        /// Sends a modifier key down message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <remarks>The key being sent must be in the <see cref="Keys"/> enum.</remarks>
        public IActionSequenceBuilder KeyDown(string theKey)
        {
            return this.KeyDown(null, theKey);
        }

        /// <summary>
        /// Sends a modifier key down message to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the key command.</param>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not part of the <see cref="Keys"/> class.</exception>
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

        /// <summary>
        /// Sends a modifier key up message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <remarks>The key being sent must be in the <see cref="Keys"/> enum.</remarks>
        public IActionSequenceBuilder KeyUp(string theKey)
        {
            return this.KeyUp(null, theKey);
        }

        /// <summary>
        /// Sends a modifier up down message to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the key command.</param>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <remarks>The key being sent must be in the <see cref="Keys"/> enum.</remarks>
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

        /// <summary>
        /// Sends a sequence of keystrokes to the browser.
        /// </summary>
        /// <param name="keysToSend">The keystrokes to send to the browser.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder SendKeys(string keysToSend)
        {
            return this.SendKeys(null, keysToSend);
        }

        /// <summary>
        /// Sends a sequence of keystrokes to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the keystrokes.</param>
        /// <param name="keysToSend">The keystrokes to send to the browser.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder SendKeys(IWebElement element, string keysToSend)
        {
            ILocatable target = element as ILocatable;
            action.AddAction(new SendKeysAction(this.keyboard, this.mouse, target, keysToSend));
            return this;
        }

        /// <summary>
        /// Clicks and holds the mouse button down on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click and hold.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder ClickAndHold(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ClickAndHoldAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Releases the mouse button on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to release the button.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder Release(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ButtonReleaseAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder Click(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ClickAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Clicks the mouse at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder Click()
        {
            return this.Click(null);
        }

        /// <summary>
        /// Double-clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to double-click.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder DoubleClick(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new DoubleClickAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveToElement(IWebElement toElement)
        {
            ILocatable target = toElement as ILocatable;
            action.AddAction(new MoveMouseAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the top-left corner of the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <param name="xOffset">The horizontal offset to which to move the mouse.</param>
        /// <param name="yOffset">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveToElement(IWebElement toElement, int xOffset, int yOffset)
        {
            ILocatable target = toElement as ILocatable;
            action.AddAction(new MoveToOffsetAction(this.mouse, target, xOffset, yOffset));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the last known mouse coordinates.
        /// </summary>
        /// <param name="xOffset">The horizontal offset to which to move the mouse.</param>
        /// <param name="yOffset">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveByOffset(int xOffset, int yOffset)
        {
            return this.MoveToElement(null, xOffset, yOffset);
        }

        /// <summary>
        /// Right-clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to right-click.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder ContextClick(IWebElement onElement)
        {
            ILocatable target = onElement as ILocatable;
            action.AddAction(new ContextClickAction(this.mouse, target));
            return this;
        }

        /// <summary>
        /// Performs a drag-and-drop operation from one element to another.
        /// </summary>
        /// <param name="source">The element on which the drag operation is started.</param>
        /// <param name="target">The element on which the drop is performed.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder DragAndDrop(IWebElement source, IWebElement target)
        {
            ILocatable startElement = source as ILocatable;
            ILocatable endElement = target as ILocatable;

            action.AddAction(new ClickAndHoldAction(this.mouse, startElement));
            action.AddAction(new MoveMouseAction(this.mouse, endElement));
            action.AddAction(new ButtonReleaseAction(this.mouse, endElement));
            return this;
        }

        /// <summary>
        /// Builds the sequence of actions.
        /// </summary>
        /// <returns>A composite <see cref="IAction"/> which can be used to perform the actions.</returns>
        public IAction Build()
        {
            CompositeAction toReturn = action;
            action = null;
            return toReturn;
        }
        #endregion
    }
}
