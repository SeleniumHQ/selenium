/* Copyright notice and license
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
        private Actions actionGenerator;

        /// <summary>
        /// Initializes a new instance of the <see cref="DefaultActionSequenceBuilder"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
        public DefaultActionSequenceBuilder(IWebDriver driver)
        {
            this.actionGenerator = new Actions(driver);
        }

        #region IActionSequenceGenerator Members
        /// <summary>
        /// Sends a modifier key down message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one 
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
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
        /// <exception cref="ArgumentException">If the key sent is not is not one 
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public IActionSequenceBuilder KeyDown(IWebElement element, string theKey)
        {
            this.actionGenerator.KeyDown(element, theKey);
            return this;
        }

        /// <summary>
        /// Sends a modifier key up message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one 
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
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
        /// <exception cref="ArgumentException">If the key sent is not is not one 
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public IActionSequenceBuilder KeyUp(IWebElement element, string theKey)
        {
            this.actionGenerator.KeyUp(element, theKey);
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
            this.actionGenerator.SendKeys(element, keysToSend);
            return this;
        }

        /// <summary>
        /// Clicks and holds the mouse button down on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click and hold.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder ClickAndHold(IWebElement onElement)
        {
            this.actionGenerator.Click(onElement);
            return this;
        }

        /// <summary>
        /// Releases the mouse button on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to release the button.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder Release(IWebElement onElement)
        {
            this.actionGenerator.Release(onElement);
            return this;
        }

        /// <summary>
        /// Clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder Click(IWebElement onElement)
        {
            this.actionGenerator.Click(onElement);
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
            this.actionGenerator.DoubleClick(onElement);
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveToElement(IWebElement toElement)
        {
            this.actionGenerator.MoveToElement(toElement);
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the top-left corner of the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveToElement(IWebElement toElement, int offsetX, int offsetY)
        {
            this.actionGenerator.MoveToElement(toElement, offsetX, offsetY);
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the last known mouse coordinates.
        /// </summary>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder MoveByOffset(int offsetX, int offsetY)
        {
            return this.MoveToElement(null, offsetX, offsetY);
        }

        /// <summary>
        /// Right-clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to right-click.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder ContextClick(IWebElement onElement)
        {
            this.actionGenerator.ContextClick(onElement);
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
            this.actionGenerator.DragAndDrop(source, target);
            return this;
        }

        /// <summary>
        /// Performs a drag-and-drop operation on one element to a specified offset.
        /// </summary>
        /// <param name="source">The element on which the drag operation is started.</param>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="DefaultActionSequenceBuilder"/>.</returns>
        public IActionSequenceBuilder DragAndDropToOffset(IWebElement source, int offsetX, int offsetY)
        {
            this.actionGenerator.DragAndDropToOffset(source, offsetX, offsetY);
            return this;
        }

        /// <summary>
        /// Builds the sequence of actions.
        /// </summary>
        /// <returns>A composite <see cref="IAction"/> which can be used to perform the actions.</returns>
        public IAction Build()
        {
            return this.actionGenerator.Build();
        }
        #endregion
    }
}
