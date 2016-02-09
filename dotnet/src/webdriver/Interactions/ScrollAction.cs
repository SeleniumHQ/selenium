// <copyright file="ScrollAction.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Creates a double tap gesture on a touch screen.
    /// </summary>
    internal class ScrollAction : TouchAction, IAction
    {
        private int offsetX;
        private int offsetY;

        /// <summary>
        /// Initializes a new instance of the <see cref="ScrollAction"/> class.
        /// </summary>
        /// <param name="touchScreen">The <see cref="ITouchScreen"/> with which the action will be performed.</param>
        /// <param name="offsetX">The horizontal offset relative to the view port.</param>
        /// <param name="offsetY">The vertical offset relative to the view port.</param>
        public ScrollAction(ITouchScreen touchScreen, int offsetX, int offsetY)
            : this(touchScreen, null, offsetX, offsetY)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ScrollAction"/> class for use with the specified element.
        /// </summary>
        /// <param name="touchScreen">The <see cref="ITouchScreen"/> with which the action will be performed.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> describing an element at which to perform the action.</param>
        /// <param name="offsetX">The x coordinate relative to the view port.</param>
        /// <param name="offsetY">The y coordinate relative to the view port.</param>
        public ScrollAction(ITouchScreen touchScreen, ILocatable actionTarget, int offsetX, int offsetY)
            : base(touchScreen, actionTarget)
        {
            if (actionTarget == null)
            {
                throw new ArgumentException("Must provide a location for a single tap action.", "actionTarget");
            }

            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }

        /// <summary>
        /// Performs the action.
        /// </summary>
        public void Perform()
        {
            this.TouchScreen.Scroll(this.ActionLocation, this.offsetX, this.offsetY);
        }
    }
}
