// <copyright file="KeyboardAction.cs" company="WebDriver Committers">
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
    /// Defines an action for keyboard interaction with the browser.
    /// </summary>
    internal class KeyboardAction : WebDriverAction
    {
        private IKeyboard keyboard;
        private IMouse mouse;

        /// <summary>
        /// Initializes a new instance of the <see cref="KeyboardAction"/> class.
        /// </summary>
        /// <param name="keyboard">The <see cref="IKeyboard"/> to use in performing the action.</param>
        /// <param name="mouse">The <see cref="IMouse"/> to use in setting focus to the element on which to perform the action.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> object providing the element on which to perform the action.</param>
        protected KeyboardAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget)
            : base(actionTarget)
        {
            this.keyboard = keyboard;
            this.mouse = mouse;
        }

        /// <summary>
        /// Gets the keyboard with which to perform the action.
        /// </summary>
        protected IKeyboard Keyboard
        {
            get { return this.keyboard; }
        }

        /// <summary>
        /// Focuses on the element on which the action is to be performed.
        /// </summary>
        protected void FocusOnElement()
        {
            if (this.ActionTarget != null)
            {
                this.mouse.Click(ActionTarget.Coordinates);
            }
        }
    }
}
