// <copyright file="RemoteKeyboard.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can execute advanced keyboard interactions.
    /// </summary>
    internal class RemoteKeyboard : IKeyboard
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteKeyboard"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the keyboard will be managed.</param>
        public RemoteKeyboard(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region IKeyboard Members
        /// <summary>
        /// Sends a sequence of keystrokes to the target.
        /// </summary>
        /// <param name="keySequence">A string representing the keystrokes to send.</param>
        public void SendKeys(string keySequence)
        {
            if (keySequence == null)
            {
                throw new ArgumentException("key sequence to send must not be null", "keySequence");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("value", keySequence.ToCharArray());
            this.driver.InternalExecute(DriverCommand.SendKeysToActiveElement, parameters);
        }

        /// <summary>
        /// Presses a key.
        /// </summary>
        /// <param name="keyToPress">The key value representing the key to press.</param>
        /// <remarks>The key value must be one of the values from the <see cref="Keys"/> class.</remarks>
        public void PressKey(string keyToPress)
        {
            if (keyToPress == null)
            {
                throw new ArgumentException("key to press must not be null", "keyToPress");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("value", keyToPress.ToCharArray());
            this.driver.InternalExecute(DriverCommand.SendKeysToActiveElement, parameters);
        }

        /// <summary>
        /// Releases a key.
        /// </summary>
        /// <param name="keyToRelease">The key value representing the key to release.</param>
        /// <remarks>The key value must be one of the values from the <see cref="Keys"/> class.</remarks>
        public void ReleaseKey(string keyToRelease)
        {
            if (keyToRelease == null)
            {
                throw new ArgumentException("key to release must not be null", "keyToRelease");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("value", keyToRelease.ToCharArray());
            this.driver.InternalExecute(DriverCommand.SendKeysToActiveElement, parameters);
        }
        #endregion
    }
}
