// <copyright file="OperaDriverService.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Opera
{
    /// <summary>
    /// Exposes the service provided by the native OperaDriver executable.
    /// </summary>
    public sealed class OperaDriverService : DriverService
    {
        private const string OperaDriverServiceFileName = "operadriver.exe";
        private static readonly Uri OperaDriverDownloadUrl = new Uri("https://github.com/operasoftware/operachromiumdriver/releases");
        private string logPath = string.Empty;
        private string urlPathPrefix = string.Empty;
        private string portServerAddress = string.Empty;
        private int adbPort = -1;
        private bool enableVerboseLogging;

        /// <summary>
        /// Initializes a new instance of the <see cref="OperaDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the OperaDriver executable.</param>
        /// <param name="executableFileName">The file name of the OperaDriver executable.</param>
        /// <param name="port">The port on which the OperaDriver executable should listen.</param>
        private OperaDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, port, executableFileName, OperaDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets the location of the log file written to by the OperaDriver executable.
        /// </summary>
        public string LogPath
        {
            get { return this.logPath; }
            set { this.logPath = value; }
        }

        /// <summary>
        /// Gets or sets the base URL path prefix for commands (e.g., "wd/url").
        /// </summary>
        public string UrlPathPrefix
        {
            get { return this.urlPathPrefix; }
            set { this.urlPathPrefix = value; }
        }

        /// <summary>
        /// Gets or sets the address of a server to contact for reserving a port.
        /// </summary>
        public string PortServerAddress
        {
            get { return this.portServerAddress; }
            set { this.portServerAddress = value; }
        }

        /// <summary>
        /// Gets or sets the port on which the Android Debug Bridge is listening for commands.
        /// </summary>
        public int AndroidDebugBridgePort
        {
            get { return this.adbPort; }
            set { this.adbPort = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to enable verbose logging for the OperaDriver executable.
        /// Defaults to <see langword="false"/>.
        /// </summary>
        public bool EnableVerboseLogging
        {
            get { return this.enableVerboseLogging; }
            set { this.enableVerboseLogging = value; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
                if (this.adbPort > 0)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --adb-port={0}", this.adbPort);
                }

                if (this.SuppressInitialDiagnosticInformation)
                {
                    argsBuilder.Append(" --silent");
                }

                if (this.enableVerboseLogging)
                {
                    argsBuilder.Append(" --verbose");
                }

                if (!string.IsNullOrEmpty(this.logPath))
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --log-path=\"{0}\"", this.logPath);
                }

                if (!string.IsNullOrEmpty(this.urlPathPrefix))
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --url-base={0}", this.urlPathPrefix);
                }

                if (!string.IsNullOrEmpty(this.portServerAddress))
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --port-server={0}", this.portServerAddress);
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the OperaDriverService.
        /// </summary>
        /// <returns>A OperaDriverService that implements default settings.</returns>
        public static OperaDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(OperaDriverServiceFileName, OperaDriverDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the OperaDriverService using a specified path to the OperaDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the OperaDriver executable.</param>
        /// <returns>A OperaDriverService using a random port.</returns>
        public static OperaDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, OperaDriverServiceFileName);
        }

        /// <summary>
        /// Creates a default instance of the OperaDriverService using a specified path to the OperaDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the OperaDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the OperaDriver executable file.</param>
        /// <returns>A OperaDriverService using a random port.</returns>
        public static OperaDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new OperaDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }
    }
}
