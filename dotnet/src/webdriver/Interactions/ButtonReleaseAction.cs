// <copyright file="ButtonReleaseAction.cs" company="WebDriver Committers">
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
    /// Defines an action for releasing the currently held mouse button.
    /// </summary>
    /// <remarks>
    /// This action can be called for an element different than the one
    /// ClickAndHoldAction was called for. However, if this action is
    /// performed out of sequence (without holding down the mouse button,
    /// for example) the results will be different.
    /// </remarks>
    internal class ButtonReleaseAction : MouseAction, IAction
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ButtonReleaseAction"/> class.
        /// </summary>
        /// <param name="mouse">The <see cref="IMouse"/> with which the action will be performed.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> describing an element at which to perform the action.</param>
        public ButtonReleaseAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        /// <summary>
        /// Performs this action.
        /// </summary>
        public void Perform()
        {
            // Releases the mouse button currently left held.
            // between browsers.
            this.MoveToLocation();
            this.Mouse.MouseUp(this.ActionLocation);
        }
    }
}
