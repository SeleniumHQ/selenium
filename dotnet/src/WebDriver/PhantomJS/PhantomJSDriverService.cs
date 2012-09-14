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
using System.Reflection;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Exposes the service provided by the native PhantomJS executable and GhostDriver JavaScript library.
    /// </summary>
    internal sealed class PhantomJSDriverService : DriverService
    {
        private const string PhantomJSDriverServiceFileName = "PhantomJS.exe";
        private const string GhostDriverMainFileName = "main.js";

        private string ghostDriverPath = string.Empty;

        /// <summary>
        /// Initializes a new instance of the PhantomJSDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the PhantomJS executable.</param>
        /// <param name="ghostDriverPath">The full path to the GhostDriver JavaScript library's main.js file.</param>
        /// <param name="port">The port on which the IEDriverServer executable should listen.</param>
        private PhantomJSDriverService(string executable, string ghostDriverPath, int port)
            : base(executable, port)
        {
            this.ghostDriverPath = ghostDriverPath;
        }

        /// <summary>
        /// Gets the executable file name of the driver service.
        /// </summary>
        protected override string DriverServiceExecutableName
        {
            get { return PhantomJSDriverServiceFileName; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(this.ghostDriverPath);
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " {0}", this.Port);
                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService.
        /// </summary>
        /// <returns>A PhantomJSDriverService that implements default settings.</returns>
        public static PhantomJSDriverService CreateDefaultService()
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

            return CreateDefaultService(currentDirectory, currentDirectory);
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService using a specified path to the PhantomJS executable
        /// and the GhostDriver JavaScript library.
        /// </summary>
        /// <param name="driverPath">The directory containing the PhantomJS executable.</param>
        /// <param name="ghostDriverPath">The directory containing the GhostDriver JavaScript library's main.js file.</param>
        /// <returns>A InternetExplorerDriverService using a random port.</returns>
        public static PhantomJSDriverService CreateDefaultService(string driverPath, string ghostDriverPath)
        {
            if (string.IsNullOrEmpty(driverPath))
            {
                throw new ArgumentException("Path to locate driver executable cannot be null or empty.", "driverPath");
            }

            string executablePath = Path.Combine(driverPath, PhantomJSDriverServiceFileName);
            if (!File.Exists(executablePath))
            {
                throw new DriverServiceNotFoundException(string.Format(CultureInfo.InvariantCulture, "The PhantomJS file {0} does not exist.", executablePath));
            }

            string ghostDriverMainPath = Path.Combine(ghostDriverPath, GhostDriverMainFileName);
            if (!File.Exists(ghostDriverMainPath))
            {
                throw new DriverServiceNotFoundException(string.Format(CultureInfo.InvariantCulture, "The GhostDriver file {0} does not exist.", ghostDriverMainPath));
            }

            return new PhantomJSDriverService(executablePath, ghostDriverMainPath, PortUtilities.FindFreePort());
        }
    }
}
