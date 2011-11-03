// <copyright file="SendKeysAction.cs" company="WebDriver Committers">
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
    /// Defines an action for sending a sequence of keystrokes to an element.
    /// </summary>
    internal class SendKeysAction : KeyboardAction, IAction
    {
        private string keysToSend;

        /// <summary>
        /// Initializes a new instance of the <see cref="SendKeysAction"/> class.
        /// </summary>
        /// <param name="keyboard">The <see cref="IKeyboard"/> to use in performing the action.</param>
        /// <param name="mouse">The <see cref="IMouse"/> to use in setting focus to the element on which to perform the action.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> object providing the element on which to perform the action.</param>
        /// <param name="keysToSend">The key sequence to send.</param>
        public SendKeysAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string keysToSend)
            : base(keyboard, mouse, actionTarget)
        {
            this.keysToSend = keysToSend;
        }

        #region IAction Members
        /// <summary>
        /// Performs this action.
        /// </summary>
        public void Perform()
        {
            this.FocusOnElement();
            this.Keyboard.SendKeys(this.keysToSend);
        }

        #endregion
    }
}
