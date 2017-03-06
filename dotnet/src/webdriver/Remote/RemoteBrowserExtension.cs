// <copyright file="RemoteBrowserExtension.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// IBrowserExtension allows you to have access to specific browser extensions installed in the current session.
    /// </summary>
    internal class RemoteBrowserExtension : IBrowserExtension
    {
        private RemoteWebDriver driver;
        private string extensionId;
        private string extensionName;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteBrowserExtension"/> class.
        /// </summary>
        /// <param name="parentDriver">The <see cref="RemoteWebDriver"/> instance hosting this browser extension.</param>
        /// <param name="id">The ID assigned to the browser extension.</param>
        /// <param name="name">The name assigned to the browser extension.</param>
        public RemoteBrowserExtension(RemoteWebDriver parentDriver, string id, string name)
        {
            this.driver = parentDriver;
            this.extensionId = id;
            this.extensionName = name;
        }

        /// <summary>
        /// Gets the name of this browser extension.
        /// </summary>
        public string Name
        {
            get
            {
                return this.extensionName;
            }
        }

        /// <summary>
        /// Retrieves a list of all browser extension actions exposed by the browser extension.
        /// </summary>
        /// <returns>ReadOnlyCollection of IBrowserExtensionAction objects so that you can interact with them</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Edge());
        /// ReadOnlyCollection<![CDATA[<IBrowserExtension>]]> exts = driver.GetBrowserExtensions();
        /// ReadOnlyCollection<![CDATA[<IBrowserExtensionAction>]]> extActions = exts[0].GetBrowserExtensionActions();
        /// </code>
        /// </example>
        public ReadOnlyCollection<IBrowserExtensionAction> GetBrowserExtensionActions()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("extensionId", this.extensionId);

            Response commandResponse = this.driver.InternalExecute(DriverCommand.GetBrowserExtensionActions, parameters);
            return this.GetBrowserExtensionActionsFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds the browser extension actions that are in the response
        /// </summary>
        /// <param name="response">Response from the browser</param>
        /// <returns>Collection of browser extension actions</returns>
        private ReadOnlyCollection<IBrowserExtensionAction> GetBrowserExtensionActionsFromResponse(Response response)
        {
            List<IBrowserExtensionAction> toReturn = new List<IBrowserExtensionAction>();
            object[] extensionActions = response.Value as object[];
            foreach (object actionObject in extensionActions)
            {
                Dictionary<string, object> actionDictionary = actionObject as Dictionary<string, object>;
                if (actionDictionary != null)
                {
                    string actionTitle = string.Empty;
                    string icon = string.Empty;
                    string badgeText = string.Empty;
                    string type = string.Empty;

                    if (actionDictionary.ContainsKey("actionTitle"))
                    {
                        actionTitle = (string)actionDictionary["actionTitle"];
                    }

                    if (actionDictionary.ContainsKey("icon"))
                    {
                        icon = (string)actionDictionary["icon"];
                    }

                    if (actionDictionary.ContainsKey("badgeText"))
                    {
                        actionTitle = (string)actionDictionary["actionTitle"];
                    }

                    if (actionDictionary.ContainsKey("type"))
                    {
                        type = (string)actionDictionary["type"];
                    }

                    RemoteBrowserExtensionAction action = this.CreateBrowserExtensionAction(actionTitle, icon, badgeText, type);
                    toReturn.Add(action);
                }
            }

            return toReturn.AsReadOnly();
        }

        /// <summary>
        /// Creates a <see cref="RemoteBrowserExtensionAction"/> with the specified properties and associates it with its parent browser extension.
        /// </summary>
        /// <param name="actionTitle">The title of the browser extension action.</param>
        /// <param name="icon">The relative path to the icon resource on disk (if applicable).</param>
        /// <param name="badgeText">The text associated with the extension action icon (if applicable).</param>
        /// <param name="type">The type of browser extension action this object represents.</param>
        /// <returns>A <see cref="RemoteBrowserExtensionAction"/> with the specified properties.</returns>
        private RemoteBrowserExtensionAction CreateBrowserExtensionAction(string actionTitle, string icon, string badgeText, string type)
        {
            RemoteBrowserExtensionAction toReturn = new RemoteBrowserExtensionAction(this.driver, this.extensionId, actionTitle, icon, badgeText, type);
            return toReturn;
        }
    }
}
