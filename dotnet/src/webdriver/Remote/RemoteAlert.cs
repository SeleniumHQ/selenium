// <copyright file="RemoteAlert.cs" company="WebDriver Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can manipulate JavaScript alerts.
    /// </summary>
    internal class RemoteAlert : IAlert
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteAlert"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the alerts will be managed.</param>
        public RemoteAlert(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets the text of the alert.
        /// </summary>
        public string Text
        {
            get
            {
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetAlertText, null);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Dismisses the alert.
        /// </summary>
        public void Dismiss()
        {
            this.driver.InternalExecute(DriverCommand.DismissAlert, null);
        }

        /// <summary>
        /// Accepts the alert.
        /// </summary>
        public void Accept()
        {
            this.driver.InternalExecute(DriverCommand.AcceptAlert, null);
        }

        /// <summary>
        /// Sends keys to the alert.
        /// </summary>
        /// <param name="keysToSend">The keystrokes to send.</param>
        public void SendKeys(string keysToSend)
        {
            if (keysToSend == null)
            {
                throw new ArgumentNullException("keysToSend", "Keys to send must not be null.");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("text", keysToSend);

            this.driver.InternalExecute(DriverCommand.SetAlertValue, parameters);
        }

        /// <summary>
        /// Sets the user name and password in an alert prompting for credentials.
        /// </summary>
        /// <param name="userName">The user name to set.</param>
        /// <param name="password">The password to set.</param>
        public void SetAuthenticationCredentials(string userName, string password)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("username", userName);
            parameters.Add("password", password);
            this.driver.InternalExecute(DriverCommand.SetAlertCredentials, parameters);
        }
    }
}
