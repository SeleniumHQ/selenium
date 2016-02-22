// <copyright file="ScreenMoveAction.cs" company="WebDriver Committers">
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

using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Presses a touch screen at a given location.
    /// </summary>
    internal class ScreenMoveAction : TouchAction, IAction
    {
        private int x;
        private int y;

        /// <summary>
        /// Initializes a new instance of the <see cref="ScreenMoveAction"/> class.
        /// </summary>
        /// <param name="touchScreen">The <see cref="ITouchScreen"/> with which the action will be performed.</param>
        /// <param name="x">The x coordinate relative to the view port.</param>
        /// <param name="y">The y coordinate relative to the view port.</param>
        public ScreenMoveAction(ITouchScreen touchScreen, int x, int y)
            : base(touchScreen, null)
        {
            this.x = x;
            this.y = y;
        }

        /// <summary>
        /// Performs the action.
        /// </summary>
        public void Perform()
        {
            this.TouchScreen.Move(this.x, this.y);
        }
    }
}
