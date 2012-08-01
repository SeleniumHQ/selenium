// <copyright file="SingleKeyAction.cs" company="WebDriver Committers">
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
    /// Defines an action for keyboard interaction with the browser using a single modifier key.
    /// </summary>
    internal class SingleKeyAction : KeyboardAction
    {
        private static readonly List<string> ModifierKeys = new List<string>() { Keys.Shift, Keys.Control, Keys.Alt };
        private string key;

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleKeyAction"/> class.
        /// </summary>
        /// <param name="keyboard">The <see cref="IKeyboard"/> to use in performing the action.</param>
        /// <param name="mouse">The <see cref="IMouse"/> to use in setting focus to the element on which to perform the action.</param>
        /// <param name="actionTarget">An <see cref="ILocatable"/> object providing the element on which to perform the action.</param>
        /// <param name="key">The modifier key (<see cref="Keys.Shift"/>, <see cref="Keys.Control"/>, <see cref="Keys.Alt"/>) to use in the action.</param>
        protected SingleKeyAction(IKeyboard keyboard, IMouse mouse, ILocatable actionTarget, string key)
            : base(keyboard, mouse, actionTarget)
        {
            if (!ModifierKeys.Contains(key))
            {
                throw new ArgumentException("key must be a modifier key (Keys.Shift, Keys.Control, or Keys.Alt)", "key");
            }

            this.key = key;
        }

        /// <summary>
        /// Gets the key with which to perform the action.
        /// </summary>
        protected string Key
        {
            get { return this.key; }
        }
    }
}
