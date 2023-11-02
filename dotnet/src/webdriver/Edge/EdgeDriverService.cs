// <copyright file="EdgeDriverService.cs" company="WebDriver Committers">
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
using System.IO;
using OpenQA.Selenium.Chromium;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Exposes the service provided by the native WebDriver executable.
    /// </summary>
    public sealed class EdgeDriverService : ChromiumDriverService
    {
        private const string MSEdgeDriverServiceFileName = "msedgedriver";

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the EdgeDriver executable.</param>
        /// <param name="executableFileName">The file name of the EdgeDriver executable.</param>
        /// <param name="port">The port on which the EdgeDriver executable should listen.</param>
        private EdgeDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, executableFileName, port)
        {
        }

        /// <summary>
        /// Gets or sets a value indicating whether the service should use verbose logging.
        /// </summary>
        public bool UseVerboseLogging
        {
            get { return this.EnableVerboseLogging; }
            set { this.EnableVerboseLogging = value; }
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService.
        /// </summary>
        /// <returns>A EdgeDriverService that implements default settings.</returns>
        public static EdgeDriverService CreateDefaultService()
        {
            return new EdgeDriverService(null, null, PortUtilities.FindFreePort());
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService.
        /// </summary>
        /// <param name="options">Browser options used to find the correct MSEdgeDriver binary.</param>
        /// <returns>A EdgeDriverService that implements default settings.</returns>
        [Obsolete("CreateDefaultService() now evaluates options in Driver constructor")]
        public static EdgeDriverService CreateDefaultService(EdgeOptions options)
        {
            string fullServicePath = DriverFinder.FullPath(options);
            return CreateDefaultService(Path.GetDirectoryName(fullServicePath), Path.GetFileName(fullServicePath));
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the EdgeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <returns>An EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath)
        {
            if (File.Exists(driverPath))
            {
                driverPath = Path.GetDirectoryName(driverPath);
            }

            return CreateDefaultService(driverPath, ChromiumDriverServiceFileName(MSEdgeDriverServiceFileName));
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the EdgeDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the EdgeDriver executable file.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new EdgeDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }

    }
}
