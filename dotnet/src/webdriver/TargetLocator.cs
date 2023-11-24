// <copyright file="TargetLocator.cs" company="WebDriver Committers">
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
using System.Text.RegularExpressions;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for finding elements on the page with locators.
    /// </summary>
    internal class TargetLocator : ITargetLocator
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="TargetLocator"/> class
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public TargetLocator(WebDriver driver)
        {
            this.driver = driver;
        }

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
                throw new ArgumentNullException(nameof(frameName), "Frame name cannot be null");
            }

            string name = Regex.Replace(frameName, @"(['""\\#.:;,!?+<>=~*^$|%&@`{}\-/\[\]\(\)])", @"\$1");
            ReadOnlyCollection<IWebElement> frameElements = this.driver.FindElements(By.CssSelector("frame[name='" + name + "'],iframe[name='" + name + "']"));
            if (frameElements.Count == 0)
            {
                frameElements = this.driver.FindElements(By.CssSelector("frame#" + name + ",iframe#" + name));
                if (frameElements.Count == 0)
                {
                    throw new NoSuchFrameException("No frame element found with name or id " + frameName);
                }
            }

            return this.Frame(frameElements[0]);
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
                throw new ArgumentNullException(nameof(frameElement), "Frame element cannot be null");
            }

            IWebDriverObjectReference elementReference = frameElement as IWebDriverObjectReference;
            if (elementReference == null)
            {
                IWrapsElement elementWrapper = frameElement as IWrapsElement;
                if (elementWrapper != null)
                {
                    elementReference = elementWrapper.WrappedElement as IWebDriverObjectReference;
                }
            }

            if (elementReference == null)
            {
                throw new ArgumentException("frameElement cannot be converted to IWebElementReference", nameof(frameElement));
            }

            Dictionary<string, object> elementDictionary = elementReference.ToDictionary();

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementDictionary);
            this.driver.InternalExecute(DriverCommand.SwitchToFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Select the parent frame of the currently selected frame.
        /// </summary>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the specified frame.</returns>
        public IWebDriver ParentFrame()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            this.driver.InternalExecute(DriverCommand.SwitchToParentFrame, parameters);
            return this.driver;
        }

        /// <summary>
        /// Change to the Window by passing in the name
        /// </summary>
        /// <param name="windowHandleOrName">Window handle or name of the window that you wish to move to</param>
        /// <returns>A WebDriver instance that is currently in use</returns>
        public IWebDriver Window(string windowHandleOrName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("handle", windowHandleOrName);
            try
            {
                this.driver.InternalExecute(DriverCommand.SwitchToWindow, parameters);
                return this.driver;
            }
            catch (NoSuchWindowException)
            {
                // simulate search by name
                string original = null;
                try
                {
                    original = this.driver.CurrentWindowHandle;
                }
                catch (NoSuchWindowException)
                {
                }

                foreach (string handle in this.driver.WindowHandles)
                {
                    this.Window(handle);
                    if (windowHandleOrName == this.driver.ExecuteScript("return window.name").ToString())
                    {
                        return this.driver; // found by name
                    }
                }

                if (original != null)
                {
                    this.Window(original);
                }

                throw;
            }
        }

        /// <summary>
        /// Creates a new browser window and switches the focus for future commands
        /// of this driver to the new window.
        /// </summary>
        /// <param name="typeHint">The type of new browser window to be created.
        /// The created window is not guaranteed to be of the requested type; if
        /// the driver does not support the requested type, a new browser window
        /// will be created of whatever type the driver does support.</param>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the new browser.</returns>
        public IWebDriver NewWindow(WindowType typeHint)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("type", typeHint.ToString().ToLowerInvariant());
            Response response = this.driver.InternalExecute(DriverCommand.NewWindow, parameters);
            Dictionary<string, object> result = response.Value as Dictionary<string, object>;
            string newWindowHandle = result["handle"].ToString();
            this.Window(newWindowHandle);
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
            return new Alert(this.driver);
        }
    }
}
