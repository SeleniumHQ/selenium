// <copyright file="MouseAction.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    /// <summary>
    /// Defines an action for mouse interaction with the browser.
    /// </summary>
    internal class MouseAction : WebDriverAction
    {
        private IMouse mouse;

        /// <summary>
        /// Initializes a new instance of the <see cref="MouseAction"/> class.
        /// </summary>
        /// <param name="mouse">The <see cref="IMouse"/> with which the action will be performed.</param>
        /// <param name="target">An <see cref="ILocatable"/> describing an element at which to perform the action.</param>
        public MouseAction(IMouse mouse, ILocatable target)
            : base(target)
        {
            this.mouse = mouse;
        }

        /// <summary>
        /// Gets the coordinates at which to perform the mouse action.
        /// </summary>
        protected ICoordinates ActionLocation
        {
            get
            {
                if (this.ActionTarget == null)
                {
                    return null;
                }

                return this.ActionTarget.Coordinates;
            }
        }

        /// <summary>
        /// Gets the mouse with which to perform the action.
        /// </summary>
        protected IMouse Mouse
        {
            get { return this.mouse; }
        }

        /// <summary>
        /// Moves the mouse to the location at which to perform the action.
        /// </summary>
        protected void MoveToLocation()
        {
            // Only call MouseMove if an actual location was provided. If not,
            // the action will happen in the last known location of the mouse
            // cursor.
            if (this.ActionLocation != null)
            {
                this.mouse.MouseMove(this.ActionLocation);
            }
        }
    }
}
