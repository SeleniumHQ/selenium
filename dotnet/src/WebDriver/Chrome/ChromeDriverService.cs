// <copyright file="ChromeDriverService.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Exposes the service provided by the native ChromeDriver executable.
    /// </summary>
    public sealed class ChromeDriverService : DriverService
    {
        private const string ChromeDriverServiceFileName = "chromedriver.exe";
        private static readonly Uri ChromeDriverDownloadUrl = new Uri("http://code.google.com/p/chromium/downloads/list");
        private string logPath = string.Empty;

        /// <summary>
        /// Initializes a new instance of the ChromeDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the ChromeDriver executable.</param>
        /// <param name="port">The port on which the ChromeDriver executable should listen.</param>
        private ChromeDriverService(string executable, int port)
            : base(executable, port, ChromeDriverServiceFileName, ChromeDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets the location of the log file written to by the ChromeDriver executable.
        /// </summary>
        public string LogPath
        {
            get { return this.logPath; }
            set { this.logPath = value; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
                if (this.SuppressInitialDiagnosticInformation)
                {
                    argsBuilder.Append(" -silent");
                }

                if (!string.IsNullOrEmpty(this.logPath))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -log-path={0}", this.logPath));
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the ChromeDriverService.
        /// </summary>
        /// <returns>A ChromeDriverService that implements default settings.</returns>
        public static ChromeDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(ChromeDriverServiceFileName, ChromeDriverDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the ChromeDriverService using a specified path to the ChromeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the ChromeDriver executable.</param>
        /// <returns>A ChromeDriverService using a random port.</returns>
        public static ChromeDriverService CreateDefaultService(string driverPath)
        {
            return new ChromeDriverService(driverPath, PortUtilities.FindFreePort());
        }
    }
}
