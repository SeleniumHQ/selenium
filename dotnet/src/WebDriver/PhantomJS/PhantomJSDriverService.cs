// <copyright file="PhantomJSDriverService.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
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

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Exposes the service provided by the native PhantomJS executable and GhostDriver JavaScript library.
    /// </summary>
    public sealed class PhantomJSDriverService : DriverService
    {
        private const string PhantomJSDriverServiceFileName = "PhantomJS.exe";
        private static readonly Uri PhantomJSDownloadUrl = new Uri("http://phantomjs.org/download.html");

        /// <summary>
        /// Initializes a new instance of the PhantomJSDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the PhantomJS executable.</param>
        /// <param name="port">The port on which the IEDriverServer executable should listen.</param>
        private PhantomJSDriverService(string executable, int port)
            : base(executable, port, PhantomJSDriverServiceFileName, PhantomJSDownloadUrl)
        {
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder();
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver={0}", this.Port);
                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService.
        /// </summary>
        /// <returns>A PhantomJSDriverService that implements default settings.</returns>
        public static PhantomJSDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(PhantomJSDriverServiceFileName, PhantomJSDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService using a specified path to the PhantomJS executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the PhantomJS executable.</param>
        /// <returns>A PhantomJSDriverService using a random port.</returns>
        public static PhantomJSDriverService CreateDefaultService(string driverPath)
        {
            return new PhantomJSDriverService(driverPath, PortUtilities.FindFreePort());
        }
    }
}
