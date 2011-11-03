// <copyright file="RemoteTargetLocator.cs" company="WebDriver Committers">
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
    /// Provides a mechanism for finding elements on the page with locators.
    /// </summary>
    internal class RemoteTargetLocator : ITargetLocator
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the RemoteTargetLocator class
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public RemoteTargetLocator(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region ITargetLocator members
        /// <summary>
        /// Move to a different frame using its index
        /// </summary>
        /// <param name="frameIndex">The index of the </param>
        /// <returns>A WebDriver instance that is currently in use</returns>
        public IWebDriver Frame(int frameIndex)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", frameIndex);
            this.driver.InternalExecute(DriverCommand.SwitchToFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Move to different frame using its name
        /// </summary>
        /// <param name="frameName">name of the frame</param>
        /// <returns>A WebDriver instance that is currently in use</returns>
        public IWebDriver Frame(string frameName)
        {
            if (frameName == null)
            {
                throw new ArgumentNullException("frameName", "Frame name cannot be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", frameName);
            this.driver.InternalExecute(DriverCommand.SwitchToFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Move to a frame element.
        /// </summary>
        /// <param name="frameElement">a previously found FRAME or IFRAME element.</param>
        /// <returns>A WebDriver instance that is currently in use.</returns>
        public IWebDriver Frame(IWebElement frameElement)
        {
            if (frameElement == null)
            {
                throw new ArgumentNullException("frameElement", "Frame element cannot be null");
            }

            RemoteWebElement convertedElement = frameElement as RemoteWebElement;
            if (convertedElement == null)
            {
                throw new ArgumentException("frameElement cannot be converted to RemoteWebElement", "frameElement");
            }

            Dictionary<string, object> elementDictionary = new Dictionary<string, object>();
            elementDictionary.Add("ELEMENT", convertedElement.InternalElementId);

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementDictionary);
            this.driver.InternalExecute(DriverCommand.SwitchToFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Change to the Window by passing in the name
        /// </summary>
        /// <param name="windowName">name of the window that you wish to move to</param>
        /// <returns>A WebDriver instance that is currently in use</returns>
        public IWebDriver Window(string windowName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("name", windowName);
            this.driver.InternalExecute(DriverCommand.SwitchToWindow, parameters);
            return this.driver;
        }

        /// <summary>
        /// Change the active frame to the default 
        /// </summary>
        /// <returns>Element of the default</returns>
        public IWebDriver DefaultContent()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", null);
            this.driver.InternalExecute(DriverCommand.SwitchToFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Finds the active element on the page and returns it
        /// </summary>
        /// <returns>Element that is active</returns>
        public IWebElement ActiveElement()
        {
            Response response = this.driver.InternalExecute(DriverCommand.GetActiveElement, null);
            return this.driver.GetElementFromResponse(response);
        }

        /// <summary>
        /// Switches to the currently active modal dialog for this particular driver instance.
        /// </summary>
        /// <returns>A handle to the dialog.</returns>
        public IAlert Alert()
        {
            // N.B. We only execute the GetAlertText command to be able to throw
            // a NoAlertPresentException if there is no alert found.
            this.driver.InternalExecute(DriverCommand.GetAlertText, null);
            return new RemoteAlert(this.driver);
        }
        #endregion
    }
}
