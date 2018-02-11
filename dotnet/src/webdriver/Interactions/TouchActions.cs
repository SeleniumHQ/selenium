// <copyright file="TouchActions.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Provides a mechanism for building advanced interactions with the browser.
    /// </summary>
    public class TouchActions : Actions
    {
        private ITouchScreen touchScreen;

        /// <summary>
        /// Initializes a new instance of the <see cref="TouchActions"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
        public TouchActions(IWebDriver driver)
            : base(driver)
        {
            IHasTouchScreen touchScreenDriver = driver as IHasTouchScreen;
            if (touchScreenDriver == null)
            {
                IWrapsDriver wrapper = driver as IWrapsDriver;
                while (wrapper != null)
                {
                    touchScreenDriver = wrapper.WrappedDriver as IHasTouchScreen;
                    if (touchScreenDriver != null)
                    {
                        break;
                    }

                    wrapper = wrapper.WrappedDriver as IWrapsDriver;
                }
            }

            if (touchScreenDriver == null)
            {
                throw new ArgumentException("The IWebDriver object must implement or wrap a driver that implements IHasTouchScreen.", "driver");
            }

            this.touchScreen = touchScreenDriver.TouchScreen;
        }

        /// <summary>
        /// Taps the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to tap.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions SingleTap(IWebElement onElement)
        {
            ILocatable locatable = GetLocatableFromElement(onElement);
            this.AddAction(new SingleTapAction(this.touchScreen, locatable));
            return this;
        }

        /// <summary>
        /// Presses down at the specified location on the screen.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Down(int locationX, int locationY)
        {
            this.AddAction(new ScreenPressAction(this.touchScreen, locationX, locationY));
            return this;
        }

        /// <summary>
        /// Releases a press at the specified location on the screen.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Up(int locationX, int locationY)
        {
            this.AddAction(new ScreenReleaseAction(this.touchScreen, locationX, locationY));
            return this;
        }

        /// <summary>
        /// Moves to the specified location on the screen.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Move(int locationX, int locationY)
        {
            this.AddAction(new ScreenMoveAction(this.touchScreen, locationX, locationY));
            return this;
        }

        /// <summary>
        /// Scrolls the touch screen beginning at the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to begin scrolling.</param>
        /// <param name="offsetX">The x coordinate relative to the view port.</param>
        /// <param name="offsetY">The y coordinate relative to the view port.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Scroll(IWebElement onElement, int offsetX, int offsetY)
        {
            ILocatable locatable = GetLocatableFromElement(onElement);
            this.AddAction(new ScrollAction(this.touchScreen, locatable, offsetX, offsetY));
            return this;
        }

        /// <summary>
        /// Double-taps the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to double-tap.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions DoubleTap(IWebElement onElement)
        {
            ILocatable locatable = GetLocatableFromElement(onElement);
            this.AddAction(new DoubleTapAction(this.touchScreen, locatable));
            return this;
        }

        /// <summary>
        /// Presses and holds on the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to press and hold</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions LongPress(IWebElement onElement)
        {
            ILocatable locatable = GetLocatableFromElement(onElement);
            this.AddAction(new LongPressAction(this.touchScreen, locatable));
            return this;
        }

        /// <summary>
        /// Scrolls the touch screen to the specified offset.
        /// </summary>
        /// <param name="offsetX">The horizontal offset relative to the view port.</param>
        /// <param name="offsetY">The vertical offset relative to the view port.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Scroll(int offsetX, int offsetY)
        {
            this.AddAction(new ScrollAction(this.touchScreen, offsetX, offsetY));
            return this;
        }

        /// <summary>
        /// Flicks the current view.
        /// </summary>
        /// <param name="speedX">The horizontal speed in pixels per second.</param>
        /// <param name="speedY">The vertical speed in pixels per second.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Flick(int speedX, int speedY)
        {
            this.AddAction(new FlickAction(this.touchScreen, speedX, speedY));
            return this;
        }

        /// <summary>
        /// Flicks the current view starting at a specific location.
        /// </summary>
        /// <param name="onElement">The element at which to start the flick.</param>
        /// <param name="offsetX">The x offset relative to the viewport.</param>
        /// <param name="offsetY">The y offset relative to the viewport.</param>
        /// <param name="speed">The speed in pixels per second.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions Flick(IWebElement onElement, int offsetX, int offsetY, int speed)
        {
            ILocatable locatable = GetLocatableFromElement(onElement);
            this.AddAction(new FlickAction(this.touchScreen, locatable, offsetX, offsetY, speed));
            return this;
        }
    }
}
