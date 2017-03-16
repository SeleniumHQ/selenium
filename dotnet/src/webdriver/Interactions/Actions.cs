// <copyright file="Actions.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Provides a mechanism for building advanced interactions with the browser.
    /// </summary>
    public class Actions : IAction
    {
        private IWebDriver driver;
        private ActionBuilder actionBuilder = new ActionBuilder();
        private PointerInputDevice defaultMouse = new PointerInputDevice(PointerKind.Mouse, "default mouse");
        private KeyInputDevice defaultKeyboard = new KeyInputDevice("default keyboard");

        private IKeyboard keyboard;
        private IMouse mouse;
        private CompositeAction action = new CompositeAction();

        /// <summary>
        /// Initializes a new instance of the <see cref="Actions"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
        public Actions(IWebDriver driver)
        {
            this.driver = driver;
            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            if (inputDevicesDriver == null)
            {
                IWrapsDriver wrapper = driver as IWrapsDriver;
                while (wrapper != null)
                {
                    inputDevicesDriver = wrapper.WrappedDriver as IHasInputDevices;
                    if (inputDevicesDriver != null)
                    {
                        this.driver = wrapper.WrappedDriver;
                        break;
                    }

                    wrapper = wrapper.WrappedDriver as IWrapsDriver;
                }
            }

            if (inputDevicesDriver == null)
            {
                throw new ArgumentException("The IWebDriver object must implement or wrap a driver that implements IHasInputDevices.", "driver");
            }

            this.keyboard = inputDevicesDriver.Keyboard;
            this.mouse = inputDevicesDriver.Mouse;
        }

        /// <summary>
        /// Sends a modifier key down message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public Actions KeyDown(string theKey)
        {
            return this.KeyDown(null, theKey);
        }

        /// <summary>
        /// Sends a modifier key down message to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the key command.</param>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public Actions KeyDown(IWebElement element, string theKey)
        {
            if (string.IsNullOrEmpty(theKey))
            {
                throw new ArgumentException("The key value must not be null or empty", "theKey");
            }

            ILocatable target = GetLocatableFromElement(element);
            this.action.AddAction(new KeyDownAction(this.keyboard, this.mouse, target, theKey));
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, TimeSpan.FromMilliseconds(250)));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            }

            this.actionBuilder.AddAction(this.defaultKeyboard.CreateKeyDown(theKey[0]));
            this.actionBuilder.AddAction(new PauseInteraction(this.defaultKeyboard, TimeSpan.FromMilliseconds(100)));
            return this;
        }

        /// <summary>
        /// Sends a modifier key up message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public Actions KeyUp(string theKey)
        {
            return this.KeyUp(null, theKey);
        }

        /// <summary>
        /// Sends a modifier up down message to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the key command.</param>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, or <see cref="Keys.Alt"/>.</exception>
        public Actions KeyUp(IWebElement element, string theKey)
        {
            if (string.IsNullOrEmpty(theKey))
            {
                throw new ArgumentException("The key value must not be null or empty", "theKey");
            }

            ILocatable target = GetLocatableFromElement(element);
            this.action.AddAction(new KeyUpAction(this.keyboard, this.mouse, target, theKey));
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, TimeSpan.FromMilliseconds(250)));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            }

            this.actionBuilder.AddAction(this.defaultKeyboard.CreateKeyUp(theKey[0]));
            return this;
        }

        /// <summary>
        /// Sends a sequence of keystrokes to the browser.
        /// </summary>
        /// <param name="keysToSend">The keystrokes to send to the browser.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions SendKeys(string keysToSend)
        {
            return this.SendKeys(null, keysToSend);
        }

        /// <summary>
        /// Sends a sequence of keystrokes to the specified element in the browser.
        /// </summary>
        /// <param name="element">The element to which to send the keystrokes.</param>
        /// <param name="keysToSend">The keystrokes to send to the browser.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions SendKeys(IWebElement element, string keysToSend)
        {
            if (string.IsNullOrEmpty(keysToSend))
            {
                throw new ArgumentException("The key value must not be null or empty", "keysToSend");
            }

            ILocatable target = GetLocatableFromElement(element);
            this.action.AddAction(new SendKeysAction(this.keyboard, this.mouse, target, keysToSend));
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, TimeSpan.FromMilliseconds(250)));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            }

            foreach (char key in keysToSend)
            {
                this.actionBuilder.AddAction(this.defaultKeyboard.CreateKeyDown(key));
                this.actionBuilder.AddAction(this.defaultKeyboard.CreateKeyUp(key));
            }

            return this;
        }

        /// <summary>
        /// Clicks and holds the mouse button down on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click and hold.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ClickAndHold(IWebElement onElement)
        {
            this.MoveToElement(onElement).ClickAndHold();
            return this;
        }

        /// <summary>
        /// Clicks and holds the mouse button at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ClickAndHold()
        {
            this.action.AddAction(new ClickAndHoldAction(this.mouse, null));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
            return this;
        }

        /// <summary>
        /// Releases the mouse button on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to release the button.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions Release(IWebElement onElement)
        {
            this.MoveToElement(onElement).Release();
            return this;
        }

        /// <summary>
        /// Releases the mouse button at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions Release()
        {
            this.action.AddAction(new ButtonReleaseAction(this.mouse, null));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            return this;
        }

        /// <summary>
        /// Clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to click.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions Click(IWebElement onElement)
        {
            this.MoveToElement(onElement).Click();
            return this;
        }

        /// <summary>
        /// Clicks the mouse at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions Click()
        {
            this.action.AddAction(new ClickAction(this.mouse, null));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            return this;
        }

        /// <summary>
        /// Double-clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to double-click.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions DoubleClick(IWebElement onElement)
        {
            this.MoveToElement(onElement).DoubleClick();
            return this;
        }

        /// <summary>
        /// Double-clicks the mouse at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions DoubleClick()
        {
            this.action.AddAction(new DoubleClickAction(this.mouse, null));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Left));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Left));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions MoveToElement(IWebElement toElement)
        {
            if (toElement == null)
            {
                throw new ArgumentException("MoveToElement cannot move to a null element with no offset.", "toElement");
            }

            ILocatable target = GetLocatableFromElement(toElement);
            this.action.AddAction(new MoveMouseAction(this.mouse, target));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(toElement, 0, 0, TimeSpan.FromMilliseconds(250)));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the top-left corner of the specified element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions MoveToElement(IWebElement toElement, int offsetX, int offsetY)
        {
            ILocatable target = GetLocatableFromElement(toElement);
            this.action.AddAction(new MoveToOffsetAction(this.mouse, target, offsetX, offsetY));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(toElement, offsetX, offsetY, TimeSpan.FromMilliseconds(250)));
            return this;
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the last known mouse coordinates.
        /// </summary>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions MoveByOffset(int offsetX, int offsetY)
        {
            this.action.AddAction(new MoveToOffsetAction(this.mouse, null, offsetX, offsetY));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(CoordinateOrigin.Pointer, offsetX, offsetY, TimeSpan.FromMilliseconds(250)));
            return this;
        }

        /// <summary>
        /// Right-clicks the mouse on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to right-click.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ContextClick(IWebElement onElement)
        {
            this.MoveToElement(onElement).ContextClick();
            return this;
        }

        /// <summary>
        /// Right-clicks the mouse at the last known mouse coordinates.
        /// </summary>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ContextClick()
        {
            this.action.AddAction(new ContextClickAction(this.mouse, null));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerDown(MouseButton.Right));
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerUp(MouseButton.Right));
            return this;
        }

        /// <summary>
        /// Performs a drag-and-drop operation from one element to another.
        /// </summary>
        /// <param name="source">The element on which the drag operation is started.</param>
        /// <param name="target">The element on which the drop is performed.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions DragAndDrop(IWebElement source, IWebElement target)
        {
            this.ClickAndHold(source).MoveToElement(target).Release(target);
            return this;
        }

        /// <summary>
        /// Performs a drag-and-drop operation on one element to a specified offset.
        /// </summary>
        /// <param name="source">The element on which the drag operation is started.</param>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions DragAndDropToOffset(IWebElement source, int offsetX, int offsetY)
        {
            this.ClickAndHold(source).MoveByOffset(offsetX, offsetY).Release();
            return this;
        }

        /// <summary>
        /// Builds the sequence of actions.
        /// </summary>
        /// <returns>A composite <see cref="IAction"/> which can be used to perform the actions.</returns>
        public IAction Build()
        {
            return this;
        }

        /// <summary>
        /// Performs the currently built action.
        /// </summary>
        public void Perform()
        {
            IActionExecutor actionExecutor = this.driver as IActionExecutor;
            if (actionExecutor.IsActionExecutor)
            {
                actionExecutor.PerformActions(this.actionBuilder.ToActionSequenceList());
            }
            else
            {
                this.action.Perform();
            }
        }

        /// <summary>
        /// Gets the <see cref="ILocatable"/> instance of the specified <see cref="IWebElement"/>.
        /// </summary>
        /// <param name="element">The <see cref="IWebElement"/> to get the location of.</param>
        /// <returns>The <see cref="ILocatable"/> of the <see cref="IWebElement"/>.</returns>
        protected static ILocatable GetLocatableFromElement(IWebElement element)
        {
            if (element == null)
            {
                return null;
            }

            ILocatable target = element as ILocatable;
            if (target == null)
            {
                IWrapsElement wrapper = element as IWrapsElement;
                while (wrapper != null)
                {
                    target = wrapper.WrappedElement as ILocatable;
                    if (target != null)
                    {
                        break;
                    }

                    wrapper = wrapper.WrappedElement as IWrapsElement;
                }
            }

            if (target == null)
            {
                throw new ArgumentException("The IWebElement object must implement or wrap an element that implements ILocatable.", "element");
            }

            return target;
        }

        /// <summary>
        /// Adds an action to current list of actions to be performed.
        /// </summary>
        /// <param name="actionToAdd">The <see cref="IAction"/> to be added.</param>
        protected void AddAction(IAction actionToAdd)
        {
            this.action.AddAction(actionToAdd);
        }
    }
}
