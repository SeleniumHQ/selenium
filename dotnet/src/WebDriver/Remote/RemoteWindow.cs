// <copyright file="RemoteWindow.cs" company="WebDriver Committers">
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
using System.Drawing;
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can manipulate the browser window.
    /// </summary>
    internal class RemoteWindow : IWindow
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWindow"/> class.
        /// </summary>
        /// <param name="driver">Instance of the driver currently in use</param>
        public RemoteWindow(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets or sets the position of the browser window relative to the upper-left corner of the screen.
        /// </summary>
        /// <remarks>When setting this property, it should act as the JavaScript window.moveTo() method.</remarks>
        public Point Position
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("windowHandle", "current");
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetWindowPosition, parameters);
                Dictionary<string, object> rawPosition = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPosition["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPosition["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }

            set
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("windowHandle", "current");
                parameters.Add("x", value.X);
                parameters.Add("y", value.Y);
                this.driver.InternalExecute(DriverCommand.SetWindowPosition, parameters);
            }
        }

        /// <summary>
        /// Gets or sets the size of the outer browser window, including title bars and window borders.
        /// </summary>
        /// <remarks>When setting this property, it should act as the JavaScript window.resizeTo() method.</remarks>
        public Size Size
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("windowHandle", "current");
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetWindowSize, parameters);
                Dictionary<string, object> rawPosition = (Dictionary<string, object>)commandResponse.Value;
                int height = Convert.ToInt32(rawPosition["height"], CultureInfo.InvariantCulture);
                int width = Convert.ToInt32(rawPosition["width"], CultureInfo.InvariantCulture);
                return new Size(width, height);
            }

            set
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("windowHandle", "current");
                parameters.Add("width", value.Width);
                parameters.Add("height", value.Height);
                this.driver.InternalExecute(DriverCommand.SetWindowSize, parameters);
            }
        }

        /// <summary>
        /// Maximizes the current window if it is not already maximized.
        /// </summary>
        public void Maximize()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("windowHandle", "current");
            this.driver.InternalExecute(DriverCommand.MaximizeWindow, parameters);
        }
    }
}
