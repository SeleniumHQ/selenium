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
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Exposes the service provided by the native IEDriverServer executable.
    /// </summary>
    public sealed class InternetExplorerDriverService : DriverService
    {
        private const string InternetExplorerDriverServiceFileName = "IEDriverServer.exe";
        private static readonly Uri InternetExplorerDriverDownloadUrl = new Uri("http://code.google.com/p/selenium/downloads/list");

        private InternetExplorerDriverLogLevel loggingLevel = InternetExplorerDriverLogLevel.Fatal;
        private string host = string.Empty;
        private string logFile = string.Empty;
        private string libraryExtractionPath = string.Empty;

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the IEDriverServer executable.</param>
        /// <param name="port">The port on which the IEDriverServer executable should listen.</param>
        private InternetExplorerDriverService(string executable, int port)
            : base(executable, port, InternetExplorerDriverServiceFileName, InternetExplorerDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets the value of the host adapter on which the IEDriverServer should listen for connections.
        /// </summary>
        public string Host
        {
            get { return this.host; }
            set { this.host = value; }
        }

        /// <summary>
        /// Gets or sets the location of the log file written to by the IEDriverServer.
        /// </summary>
        public string LogFile
        {
            get { return this.logFile; }
            set { this.logFile = value; }
        }

        /// <summary>
        /// Gets or sets the logging level used by the IEDriverServer.
        /// </summary>
        public InternetExplorerDriverLogLevel LoggingLevel
        {
            get { return this.loggingLevel; }
            set { this.loggingLevel = value; }
        }

        /// <summary>
        /// Gets or sets the path to which the supporting library of the IEDriverServer.exe is extracted.
        /// Defaults to the temp directory if this property is not set.
        /// </summary>
        /// <remarks>
        /// The IEDriverServer.exe requires extraction of a supporting library to perform some of its functions. Setting
        /// This library is extracted to the temp directory if this property is not set. If the property is set, it must
        /// be set to a valid directory.
        /// </remarks>
        public string LibraryExtractionPath
        {
            get { return this.libraryExtractionPath; }
            set { this.libraryExtractionPath = value; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
                if (!string.IsNullOrEmpty(this.host))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -host={0}", this.host));
                }

                if (!string.IsNullOrEmpty(this.logFile))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -log-file={0}", this.logFile));
                }

                if (!string.IsNullOrEmpty(this.libraryExtractionPath))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -extract-path={0}", this.libraryExtractionPath));
                }

                if (this.loggingLevel != InternetExplorerDriverLogLevel.Fatal)
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -log-level={0}", this.loggingLevel.ToString().ToUpperInvariant()));
                }

                if (this.SuppressInitialDiagnosticInformation)
                {
                    argsBuilder.Append(" -silent");
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the InternetExplorerDriverService.
        /// </summary>
        /// <returns>A InternetExplorerDriverService that implements default settings.</returns>
        public static InternetExplorerDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(InternetExplorerDriverServiceFileName, InternetExplorerDriverDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the InternetExplorerDriverService using a specified path to the IEDriverServer executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the IEDriverServer executable.</param>
        /// <returns>A InternetExplorerDriverService using a random port.</returns>
        public static InternetExplorerDriverService CreateDefaultService(string driverPath)
        {
            return new InternetExplorerDriverService(driverPath, PortUtilities.FindFreePort());
        }
    }
}
