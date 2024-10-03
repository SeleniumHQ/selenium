// <copyright file="SeleniumManager.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Finds a driver, checks if the provided path exists, if not, Selenium Manager is used.
    /// This implementation is still in beta and may change.
    /// </summary>
    public class DriverFinder
    {
        private DriverOptions options;
        private Dictionary<string, string> paths = new Dictionary<string, string>();
        private const string BrowserPathKey = "browser_path";
        private const string DriverPathKey = "driver_path";

        /// <summary>
        /// Initializes a new instance of the <see cref="DriverFinder"/> class.
        /// </summary>
        public DriverFinder(DriverOptions options)
        {
            this.options = options;
        }

        /// <summary>
        /// Gets the browser path retrieved by Selenium Manager
        /// </summary>
        /// <returns>
        /// The full browser path
        /// </returns>
        public string GetBrowserPath()
        {
            return BinaryPaths()[BrowserPathKey];
        }

        /// <summary>
        /// Gets the driver path retrieved by Selenium Manager
        /// </summary>
        /// <returns>
        /// The full driver path
        /// </returns>
        public string GetDriverPath()
        {
            return BinaryPaths()[DriverPathKey];
        }

        public bool HasBrowserPath()
        {
            return !string.IsNullOrWhiteSpace(GetBrowserPath());
        }

        /// <summary>
        /// Invokes Selenium Manager to get the binaries paths and validates if they exist.
        /// </summary>
        /// <returns>
        /// A Dictionary with the validated browser and driver path. 
        /// </returns>
        /// <exception cref="NoSuchDriverException">If one of the paths does not exist.</exception>
        private Dictionary<string, string> BinaryPaths()
        {
            if (paths.ContainsKey(DriverPathKey) && !string.IsNullOrWhiteSpace(paths[DriverPathKey]))
            {
                return paths;
            }
            Dictionary<string, string> binaryPaths = SeleniumManager.BinaryPaths(CreateArguments());
            string driverPath = binaryPaths[DriverPathKey];
            string browserPath = binaryPaths[BrowserPathKey];
            if (File.Exists(driverPath))
            {
                paths.Add(DriverPathKey, driverPath);
            }
            else
            {
                throw new NoSuchDriverException($"The driver path is not a valid file: {driverPath}");
            }
            if (File.Exists(browserPath))
            {
                paths.Add(BrowserPathKey, browserPath);
            }
            else
            {
                throw new NoSuchDriverException($"The browser path is not a valid file: {browserPath}");
            }
            return paths;
        }

        /// <summary>
        /// Create arguments to invoke Selenium Manager
        /// </summary>
        /// <returns>
        /// A string with all arguments to invoke Selenium Manager
        /// </returns>
        /// <exception cref="NoSuchDriverException"></exception>
        private string CreateArguments()
        {
            StringBuilder argsBuilder = new StringBuilder();
            argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser \"{0}\"", options.BrowserName);

            if (!string.IsNullOrEmpty(options.BrowserVersion))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-version {0}", options.BrowserVersion);
            }

            string browserBinary = options.BinaryLocation;
            if (!string.IsNullOrEmpty(browserBinary))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-path \"{0}\"", browserBinary);
            }

            if (options.Proxy != null)
            {
                if (options.Proxy.SslProxy != null)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.SslProxy);
                }
                else if (options.Proxy.HttpProxy != null)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.HttpProxy);
                }
            }

            return argsBuilder.ToString();
        }

    }
}
