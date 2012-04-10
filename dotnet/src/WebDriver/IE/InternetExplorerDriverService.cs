// <copyright file="InternetExplorerDriverService.cs" company="WebDriver Committers">
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
using System.Reflection;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Exposes the service provided by the native ChromeDriver executable.
    /// </summary>
    public sealed class InternetExplorerDriverService : DriverService
    {
        private const string InternetExplorerDriverServiceFileName = "IEDriverServer.exe";
        private const string InternetExplorerDriverDownloadUrl = "http://code.google.com/p/selenium/downloads/list";

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the InternetExplorerDriver executable.</param>
        /// <param name="port">The port on which the InternetExplorerDriver executable should listen.</param>
        private InternetExplorerDriverService(string executable, int port)
            : base(executable, port)
        {
        }

        /// <summary>
        /// Gets the executable file name of the driver service.
        /// </summary>
        protected override string DriverServiceExecutableName
        {
            get { return InternetExplorerDriverServiceFileName; }
        }

        /// <summary>
        /// Creates a default instance of the InternetExplorerDriverService.
        /// </summary>
        /// <returns>A InternetExplorerDriverService that implements default settings.</returns>
        public static InternetExplorerDriverService CreateDefaultService()
        {
            Assembly executingAssembly = Assembly.GetExecutingAssembly();
            string currentDirectory = Path.GetDirectoryName(executingAssembly.Location);

            // If we're shadow copying, fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = Path.GetDirectoryName(uri.LocalPath);
            }

            return CreateDefaultService(currentDirectory);
        }

        /// <summary>
        /// Creates a default instance of the InternetExplorerDriverService using a specified path to the ChromeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the InternetExplorerDriver executable.</param>
        /// <returns>A InternetExplorerDriverService using a random port.</returns>
        public static InternetExplorerDriverService CreateDefaultService(string driverPath)
        {
            if (string.IsNullOrEmpty(driverPath))
            {
                throw new ArgumentException("Path to locate driver executable cannot be null or empty.", "driverPath");
            }

            string executablePath = Path.Combine(driverPath, InternetExplorerDriverServiceFileName);
            if (!File.Exists(executablePath))
            {
                throw new DriverServiceNotFoundException(string.Format(CultureInfo.InvariantCulture, "The file {0} does not exist. The driver can be downloaded at {1}", executablePath, InternetExplorerDriverDownloadUrl));
            }

            return new InternetExplorerDriverService(executablePath, PortUtilities.FindFreePort());
        }
    }
}
