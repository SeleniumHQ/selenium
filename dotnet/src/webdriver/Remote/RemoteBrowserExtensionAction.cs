// <copyright file="RemoteBrowserExtensionAction.cs" company="WebDriver Committers">
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
    /// RemoteBrowserExtensionAction allows you to have access to specific browser extension actions exposed by a browser extensions
    /// </summary>
    internal class RemoteBrowserExtensionAction : IBrowserExtensionAction
    {
        private RemoteWebDriver driver;
        private string extensionId;
        private string actionTitle;
        private string icon;
        private string badgeText;
        private string type;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteBrowserExtensionAction"/> class.
        /// </summary>
        /// <param name="parentDriver">The <see cref="RemoteWebDriver"/> instance hosting the browser extension exposing this action.</param>
        /// <param name="parentExtensionId">The ID assigned to this action's parent browser extension.</param>
        /// <param name="actionTitle">The title of the browser extension action.</param>
        /// <param name="icon">The relative path to the icon resource on disk (if applicable).</param>
        /// <param name="badgeText">The text associated with the extension action icon (if applicable).</param>
        /// <param name="type">The type of browser extension action this object represents.</param>
        public RemoteBrowserExtensionAction(RemoteWebDriver parentDriver, string parentExtensionId, string actionTitle, string icon, string badgeText, string type)
        {
            this.driver = parentDriver;
            this.extensionId = parentExtensionId;
            this.actionTitle = actionTitle;
            this.icon = icon;
            this.badgeText = badgeText;
            this.type = type;
        }

        /// <summary>
        /// Gets the title of this browser extension action.
        /// </summary>
        public string ActionTitle
        {
            get
            {
                return this.actionTitle;
            }
        }

        /// <summary>
        /// Gets the relative path to the browser extension action's icon resource on disk (if applicable).
        /// </summary>
        public string Icon
        {
            get
            {
                return this.icon;
            }
        }

        /// <summary>
        /// Gets the text associated with the extension action icon (if applicable).
        /// </summary>
        public string BadgeText
        {
            get
            {
                return this.badgeText;
            }
        }

        /// <summary>
        /// Gets the type of the browser extension action.
        /// </summary>
        public string Type
        {
            get
            {
                return this.type;
            }
        }

        /// <summary>
        /// Invokes an action exposed by the browser extension action.
        /// </summary>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Edge());
        /// ReadOnlyCollection<![CDATA[<IBrowserExtension>]]> exts = driver.GetBrowserExtensions();
        /// ReadOnlyCollection<![CDATA[<IBrowserExtensionAction>]]> extActions = exts[0].GetBrowserExtensionActions();
        /// extActions[0].TakeAction()
        /// </code>
        /// </example>
        public void TakeAction()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("extensionId", this.extensionId);
            parameters.Add("type", this.type);

            this.driver.InternalExecute(DriverCommand.TakeBrowserExtensionAction, parameters);
        }
    }
}
