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
        private readonly TimeSpan DefaultScrollMoveDuration = TimeSpan.FromSeconds(2);
        private readonly TimeSpan DefaultLongPressDuration = TimeSpan.FromSeconds(2);
        private readonly TimeSpan DefaultFlickDuration = TimeSpan.FromMilliseconds(100);
        private ActionBuilder actionBuilder = new ActionBuilder();
        private PointerInputDevice defaultTouchscreen = new PointerInputDevice(PointerKind.Touch, "default touch pointer");

        /// <summary>
        /// Initializes a new instance of the <see cref="TouchActions"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object on which the actions built will be performed.</param>
        public TouchActions(IWebDriver driver)
            : base(driver)
        {
        }

        /// <summary>
        /// Taps the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to tap.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions SingleTap(IWebElement onElement)
        {
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(onElement, 0, 0, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
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
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, locationX, locationY, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
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
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, locationX, locationY, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
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
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, locationX, locationY, TimeSpan.Zero));
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
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(onElement, 0, 0, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, offsetX, offsetX, DefaultScrollMoveDuration));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
            return this;
        }

        /// <summary>
        /// Double-taps the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to double-tap.</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions DoubleTap(IWebElement onElement)
        {
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(onElement, 0, 0, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
            return this;
        }

        /// <summary>
        /// Presses and holds on the touch screen on the specified element.
        /// </summary>
        /// <param name="onElement">The element on which to press and hold</param>
        /// <returns>A self-reference to this <see cref="TouchActions"/>.</returns>
        public TouchActions LongPress(IWebElement onElement)
        {
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(onElement, 0, 0, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePause(DefaultLongPressDuration));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
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
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, offsetX, offsetX, DefaultScrollMoveDuration));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
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
            int offsetX = Convert.ToInt32(Math.Round(speedX * DefaultFlickDuration.TotalSeconds, 0));
            int offsetY = Convert.ToInt32(Math.Round(speedY * DefaultFlickDuration.TotalSeconds, 0));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, offsetX, offsetX, DefaultFlickDuration));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
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
            int normalizedOffsetX = Convert.ToInt32(offsetX / speed * DefaultFlickDuration.TotalSeconds);
            int normalizedOffsetY = Convert.ToInt32(offsetY / speed * DefaultFlickDuration.TotalSeconds);
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(onElement, 0, 0, TimeSpan.Zero));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerDown(MouseButton.Touch));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerMove(CoordinateOrigin.Viewport, normalizedOffsetX, normalizedOffsetY, DefaultFlickDuration));
            this.actionBuilder.AddAction(this.defaultTouchscreen.CreatePointerUp(MouseButton.Touch));
            return this;
        }
    }
}
