// <copyright file="EdgeDriverService.cs" company="Microsoft">
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
using System.Globalization;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Chromium;

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Exposes the service provided by the native WebDriver executable.
    /// </summary>
    public class EdgeDriverService : ChromiumDriverService
    {
        private const string MSEdgeDriverServiceFileName = "msedgedriver";

        protected static readonly Uri MicrosoftWebDriverDownloadUrl = new Uri("https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/");

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the EdgeDriver executable.</param>
        /// <param name="executableFileName">The file name of the EdgeDriver executable.</param>
        /// <param name="port">The port on which the EdgeDriver executable should listen.</param>
        protected EdgeDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, executableFileName, port, MicrosoftWebDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService.
        /// </summary>
        /// <returns>An EdgeDriverService that implements default settings.</returns>
        public static EdgeDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(ChromiumDriverServiceFileName(MSEdgeDriverServiceFileName),
                                                                                MicrosoftWebDriverDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the EdgeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <returns>An EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, ChromiumDriverServiceFileName(MSEdgeDriverServiceFileName));
        }

        /// <summary> 
        /// Creates a default instance of the EdgeDriverService using a specified path to the EdgeDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the EdgeDriver executable file.</param>
        /// <returns>An EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return CreateDefaultService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the EdgeDriver executable with the given name and listening port.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the EdgeDriver executable file</param>
        /// <param name="port">The port number on which the driver will listen</param>
        /// <returns>An EdgeDriverService using the specified port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath, string driverExecutableFileName, int port)
        {
            return new EdgeDriverService(driverPath, driverExecutableFileName, port);
        }
    }
}
