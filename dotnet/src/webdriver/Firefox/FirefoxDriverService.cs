// <copyright file="FirefoxDriverService.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Exposes the service provided by the native FirefoxDriver executable.
    /// </summary>
    public sealed class FirefoxDriverService : DriverService
    {
        private const string FirefoxDriverServiceFileName = "wires.exe";
        private static readonly Uri FirefoxDriverDownloadUrl = new Uri("https://github.com/jgraham/wires/releases");
        private string browserBinaryPath = @"C:\Program Files (x86)\Nightly\firefox.exe";
        private int browserCommunicationPort = -1;

        /// <summary>
        /// Initializes a new instance of the FirefoxDriverService class.
        /// </summary>
        /// <param name="executablePath">The full path to the Firefox driver executable.</param>
        /// <param name="executableFileName">The file name of the Firefox driver executable.</param>
        /// <param name="port">The port on which the Firefox driver executable should listen.</param>
        private FirefoxDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, port, executableFileName, FirefoxDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets the location of the Firefox binary executable.
        /// </summary>
        public string FirefoxBinaryPath
        {
            get { return this.browserBinaryPath; }
            set { this.browserBinaryPath = value; }
        }

        /// <summary>
        /// Gets or sets the port used by the driver executable to communicate with the browser.
        /// </summary>
        public int BrowserCommunicationPort
        {
            get { return this.browserCommunicationPort; }
            set { this.browserCommunicationPort = value; }
        }

        /// <summary>
        /// Gets a value indicating whether to ignore the absence of a status end point.
        /// </summary>
        protected override bool IgnoreMissingStatusEndPoint
        {
            get { return true; }
        }

        /// <summary>
        /// Gets a value indicating the time to wait for an initial connection before timing out.
        /// </summary>
        protected override TimeSpan InitialConnectionTimeout
        {
            get { return TimeSpan.FromSeconds(2); }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder();
                if (this.browserCommunicationPort > 0)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --marionette-port {0}", this.browserCommunicationPort);
                }

                if (this.Port > 0)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver-port {0}", this.Port);
                }

                if (!string.IsNullOrEmpty(this.browserBinaryPath))
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --binary \"{0}\"", this.browserBinaryPath);
                }

                return argsBuilder.ToString().Trim();
            }
        }

        /// <summary>
        /// Creates a default instance of the FirefoxDriverService.
        /// </summary>
        /// <returns>A FirefoxDriverService that implements default settings.</returns>
        public static FirefoxDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(FirefoxDriverServiceFileName, FirefoxDriverDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the FirefoxDriverService using a specified path to the Firefox driver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the Firefox driver executable.</param>
        /// <returns>A FirefoxDriverService using a random port.</returns>
        public static FirefoxDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, FirefoxDriverServiceFileName);
        }

        /// <summary>
        /// Creates a default instance of the FirefoxDriverService using a specified path to the ChromeDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the Firefox driver executable.</param>
        /// <param name="driverExecutableFileName">The name of th  Firefox driver executable file.</param>
        /// <returns>A FirefoxDriverService using a random port.</returns>
        public static FirefoxDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new FirefoxDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }
    }
}
