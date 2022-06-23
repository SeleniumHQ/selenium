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
using System.Drawing;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Provides a mechanism for building advanced interactions with the browser.
    /// </summary>
    public class Actions : IAction
    {
        private readonly TimeSpan DefaultScrollDuration = TimeSpan.FromMilliseconds(250);
        private readonly TimeSpan DefaultMouseMoveDuration = TimeSpan.FromMilliseconds(250);
        private ActionBuilder actionBuilder = new ActionBuilder();
        private PointerInputDevice defaultMouse = new PointerInputDevice(PointerKind.Mouse, "default mouse");
        private KeyInputDevice defaultKeyboard = new KeyInputDevice("default keyboard");
        private WheelInputDevice defaultWheel = new WheelInputDevice("default wheel");
        private IActionExecutor actionExecutor;

        /// <summary>
        /// Initializes a new instance of the <see cref="Actions"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
        public Actions(IWebDriver driver)
        {
            IActionExecutor actionExecutor = GetDriverAs<IActionExecutor>(driver);
            if (actionExecutor == null)
            {
                throw new ArgumentException("The IWebDriver object must implement or wrap a driver that implements IActionExecutor.", nameof(driver));
            }

            this.actionExecutor = actionExecutor;
        }

        /// <summary>
        /// Returns the <see cref="IActionExecutor"/> for the driver.
        /// </summary>
        protected IActionExecutor ActionExecutor
        {
            get { return this.actionExecutor; }
        }

        /// <summary>
        /// Sends a modifier key down message to the browser.
        /// </summary>
        /// <param name="theKey">The key to be sent.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="ArgumentException">If the key sent is not is not one
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, <see cref="Keys.Alt"/>,
        /// <see cref="Keys.Meta"/>, <see cref="Keys.Command"/>,<see cref="Keys.LeftAlt"/>,
        /// <see cref="Keys.LeftControl"/>,<see cref="Keys.LeftShift"/>.</exception>
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
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, <see cref="Keys.Alt"/>,
        /// <see cref="Keys.Meta"/>, <see cref="Keys.Command"/>,<see cref="Keys.LeftAlt"/>,
        /// <see cref="Keys.LeftControl"/>,<see cref="Keys.LeftShift"/>.</exception>
        public Actions KeyDown(IWebElement element, string theKey)
        {
            if (string.IsNullOrEmpty(theKey))
            {
                throw new ArgumentException("The key value must not be null or empty", nameof(theKey));
            }

            ILocatable target = GetLocatableFromElement(element);
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, DefaultMouseMoveDuration));
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
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, <see cref="Keys.Alt"/>,
        /// <see cref="Keys.Meta"/>, <see cref="Keys.Command"/>,<see cref="Keys.LeftAlt"/>,
        /// <see cref="Keys.LeftControl"/>,<see cref="Keys.LeftShift"/>.</exception>
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
        /// of <see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, <see cref="Keys.Alt"/>,
        /// <see cref="Keys.Meta"/>, <see cref="Keys.Command"/>,<see cref="Keys.LeftAlt"/>,
        /// <see cref="Keys.LeftControl"/>,<see cref="Keys.LeftShift"/>.</exception>
        public Actions KeyUp(IWebElement element, string theKey)
        {
            if (string.IsNullOrEmpty(theKey))
            {
                throw new ArgumentException("The key value must not be null or empty", nameof(theKey));
            }

            ILocatable target = GetLocatableFromElement(element);
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, DefaultMouseMoveDuration));
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
                throw new ArgumentException("The key value must not be null or empty", nameof(keysToSend));
            }

            ILocatable target = GetLocatableFromElement(element);
            if (element != null)
            {
                this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(element, 0, 0, DefaultMouseMoveDuration));
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
                throw new ArgumentException("MoveToElement cannot move to a null element with no offset.", nameof(toElement));
            }

            return this.MoveToElement(toElement, 0, 0);
        }

        /// <summary>
        /// Moves the mouse to the specified offset of the top-left corner of the specified element.
        /// In Selenium 4.3 the origin for the offset will be the in-view center point of the element.
        /// </summary>
        /// <param name="toElement">The element to which to move the mouse.</param>
        /// <param name="offsetX">The horizontal offset to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset to which to move the mouse.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions MoveToElement(IWebElement toElement, int offsetX, int offsetY)
        {
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(toElement, offsetX, offsetY, DefaultMouseMoveDuration));
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
            this.actionBuilder.AddAction(this.defaultMouse.CreatePointerMove(CoordinateOrigin.Pointer, offsetX, offsetY, DefaultMouseMoveDuration));
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
        /// If the element is outside the viewport, scrolls the bottom of the element to the bottom of the viewport.
        /// </summary>
        /// <param name="element">Which element to scroll into the viewport.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ScrollToElement(IWebElement element)
        {
            this.actionBuilder.AddAction(this.defaultWheel.CreateWheelScroll(element, 0, 0, 0, 0, DefaultScrollDuration));

            return this;
        }

        /// <summary>
        /// Scrolls by provided amounts with the origin in the top left corner of the viewport.
        /// </summary>
        /// <param name="deltaX">Distance along X axis to scroll using the wheel. A negative value scrolls left.</param>
        /// <param name="deltaY">Distance along Y axis to scroll using the wheel. A negative value scrolls up.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions ScrollByAmount(int deltaX, int deltaY)
        {
            this.actionBuilder.AddAction(this.defaultWheel.CreateWheelScroll(deltaX, deltaY, DefaultScrollDuration));

            return this;
        }

        /// <summary>
        /// Scrolls by provided amount based on a provided origin.
        /// </summary>
        /// <remarks>
        /// The scroll origin is either the center of an element or the upper left of the viewport plus any offsets.
        /// If the origin is an element, and the element is not in the viewport, the bottom of the element will first
        /// be scrolled to the bottom of the viewport.
        /// </remarks>
        /// <param name="scrollOrigin">Where scroll originates (viewport or element center) plus provided offsets.</param>
        /// <param name="deltaX">Distance along X axis to scroll using the wheel. A negative value scrolls left.</param>
        /// <param name="deltaY">Distance along Y axis to scroll using the wheel. A negative value scrolls up.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        /// <exception cref="MoveTargetOutOfBoundsException">If the origin with offset is outside the viewport.</exception>
        public Actions ScrollFromOrigin(WheelInputDevice.ScrollOrigin scrollOrigin, int deltaX, int deltaY)
        {
            if (scrollOrigin.Viewport && scrollOrigin.Element != null)
            {
                throw new ArgumentException("viewport can not be true if an element is defined.", nameof(scrollOrigin));
            }

            if (scrollOrigin.Viewport)
            {
                this.actionBuilder.AddAction(this.defaultWheel.CreateWheelScroll(CoordinateOrigin.Viewport,
                    scrollOrigin.XOffset, scrollOrigin.YOffset, deltaX, deltaY, DefaultScrollDuration));
            }
            else
            {
                this.actionBuilder.AddAction(this.defaultWheel.CreateWheelScroll(scrollOrigin.Element,
                    scrollOrigin.XOffset, scrollOrigin.YOffset, deltaX, deltaY, DefaultScrollDuration));
            }

            return this;
        }

        /// <summary>
        /// Performs a Pause.
        /// </summary>
        /// <param name="duration">How long to pause the action chain.</param>
        /// <returns>A self-reference to this <see cref="Actions"/>.</returns>
        public Actions Pause(TimeSpan duration)
        {
            this.actionBuilder.AddAction(new PauseInteraction(this.defaultMouse, duration));
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
            this.actionExecutor.PerformActions(this.actionBuilder.ToActionSequenceList());
            this.actionBuilder.ClearSequences();
        }

        /// <summary>
        /// Clears the list of actions to be performed.
        /// </summary>
        public void Reset()
        {
            this.actionBuilder = new ActionBuilder();
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

            ILocatable target = null;
            IWrapsElement wrapper = element as IWrapsElement;
            while (wrapper != null)
            {
                target = wrapper.WrappedElement as ILocatable;
                wrapper = wrapper.WrappedElement as IWrapsElement;
            }

            if (target == null)
            {
                target = element as ILocatable;
            }

            if (target == null)
            {
                throw new ArgumentException("The IWebElement object must implement or wrap an element that implements ILocatable.", nameof(element));
            }

            return target;
        }

        private T GetDriverAs<T>(IWebDriver driver) where T : class
        {
            T driverAsType = driver as T;
            if (driverAsType == null)
            {
                IWrapsDriver wrapper = driver as IWrapsDriver;
                while (wrapper != null)
                {
                    driverAsType = wrapper.WrappedDriver as T;
                    if (driverAsType != null)
                    {
                        driver = wrapper.WrappedDriver;
                        break;
                    }

                    wrapper = wrapper.WrappedDriver as IWrapsDriver;
                }
            }

            return driverAsType;
        }
    }
}
