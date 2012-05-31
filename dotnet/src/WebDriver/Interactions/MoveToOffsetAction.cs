// <copyright file="MoveToOffsetAction.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Defines an action for moving the mouse to a specified offset from its current location.
    /// </summary>
    internal class MoveToOffsetAction : MouseAction, IAction
    {
        private int offsetX;
        private int offsetY;

        /// <summary>
        /// Initializes a new instance of the <see cref="MoveToOffsetAction"/> class.
        /// </summary>
        /// <param name="mouse">The <see cref="IMouse"/> with which the action will be performed.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> describing an element at which to perform the action.</param>
        /// <param name="offsetX">The horizontal offset from the origin of the target to which to move the mouse.</param>
        /// <param name="offsetY">The vertical offset from the origin of the target to which to move the mouse.</param>
        public MoveToOffsetAction(IMouse mouse, ILocatable actionTarget, int offsetX, int offsetY)
            : base(mouse, actionTarget)
        {
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }

        #region IAction Members
        /// <summary>
        /// Performs this action.
        /// </summary>
        public void Perform()
        {
            this.Mouse.MouseMove(this.ActionLocation, this.offsetX, this.offsetY);
        }

        #endregion
    }
}
