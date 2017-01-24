// <copyright file="RemoteTargetLocator.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism for finding elements on the page with locators.
    /// </summary>
    internal class RemoteTargetLocator : ITargetLocator
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteTargetLocator"/> class
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public RemoteTargetLocator(RemoteWebDriver driver)
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
                throw new ArgumentNullException("frameName", "Frame name cannot be null");
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
                throw new ArgumentNullException("frameElement", "Frame element cannot be null");
            }

            IWebElementReference elementReference = frameElement as IWebElementReference;
            if (elementReference == null)
            {
                IWrapsElement elementWrapper = frameElement as IWrapsElement;
                if (elementWrapper != null)
                {
                    elementReference = elementWrapper.WrappedElement as IWebElementReference;
                }
            }

            if (elementReference == null)
            {
                throw new ArgumentException("frameElement cannot be converted to IWebElementReference", "frameElement");
            }

            // TODO: Remove "ELEMENT" addition when all remote ends are spec-compliant.
            Dictionary<string, object> elementDictionary = elementReference.ToDictionary();
            elementDictionary.Add("ELEMENT", elementReference.ElementReferenceId);

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
            if (this.driver.IsSpecificationCompliant)
            {
                parameters.Add("handle", windowHandleOrName);
                try
                {
                    this.driver.InternalExecute(DriverCommand.SwitchToWindow, parameters);
                    return this.driver;
                }
                catch (NoSuchWindowException)
                {
                    // simulate search by name
                    string original = this.driver.CurrentWindowHandle;
                    foreach (string handle in this.driver.WindowHandles)
                    {
                        this.Window(handle);
                        if (windowHandleOrName == this.driver.ExecuteScript("return window.name").ToString())
                        {
                            return this.driver; // found by name
                        }
                    }

                    this.Window(original);
                    throw;
                }
            }
            else
            {
                parameters.Add("name", windowHandleOrName);
            }

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
    }
}
