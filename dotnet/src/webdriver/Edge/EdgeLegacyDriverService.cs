// <copyright file="EdgeLegacyDriverService.cs" company="Microsoft">
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

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Exposes the service provided by the native MicrosoftWebDriver executable.
    /// </summary>
    public sealed class EdgeLegacyDriverService : EdgeDriverService
    {
        private const string MicrosoftWebDriverServiceFileName = "MicrosoftWebDriver.exe";

        private string host;
        private string package;
        private bool? useSpecCompliantProtocol;

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeLegacyDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the EdgeDriver executable.</param>
        /// <param name="executableFileName">The file name of the EdgeDriver executable.</param>
        /// <param name="port">The port on which the EdgeDriver executable should listen.</param>
        private EdgeLegacyDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, executableFileName, port)
        {
        }

        /// <summary>
        /// Gets or sets the value of the host adapter on which the Edge driver service should listen for connections.
        /// </summary>
        public string Host
        {
            get { return this.host; }
            set { this.host = value; }
        }

        /// <summary>
        /// Gets or sets the value of the package the Edge driver service will launch and automate.
        /// </summary>
        public string Package
        {
            get { return this.package; }
            set { this.package = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the service should use verbose logging.
        /// </summary>
        public bool UseVerboseLogging
        {
            // ChromiumDriverService already provides EnableVerboseLogging. Keeping UseVerboseLogging
            // here though to support existing callers.
            get { return this.EnableVerboseLogging; }
            set { this.EnableVerboseLogging = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the <see cref="EdgeLegacyDriverService"/> instance
        /// should use the a protocol dialect compliant with the W3C WebDriver Specification.
        /// </summary>
        /// <remarks>
        /// Setting this property to a non-<see langword="null"/> value for driver
        /// executables matched to versions of Windows before the 2018 Fall Creators
        /// Update will result in a the driver executable shutting down without
        /// execution, and all commands will fail. Do not set this property unless
        /// you are certain your version of the MicrosoftWebDriver.exe supports the
        /// --w3c and --jwp command-line arguments.
        /// </remarks>
        public bool? UseSpecCompliantProtocol
        {
            get { return this.useSpecCompliantProtocol; }
            set { this.useSpecCompliantProtocol = value; }
        }

        /// <summary>
        /// Gets a value indicating whether the service has a shutdown API that can be called to terminate
        /// it gracefully before forcing a termination.
        /// </summary>
        protected override bool HasShutdown
        {
            get
            {
                if (this.useSpecCompliantProtocol.HasValue && !this.useSpecCompliantProtocol.Value)
                {
                    return base.HasShutdown;
                }

                return false;
            }
        }

        /// <summary>
        /// Gets a value indicating the time to wait for the service to terminate before forcing it to terminate.
        /// </summary>
        protected override TimeSpan TerminationTimeout
        {
            // Use a very small timeout for terminating the Edge driver,
            // because the executable does not have a clean shutdown command,
            // which means we have to kill the process. Using a short timeout
            // gets us to the termination point much faster.
            get
            {
                if (this.useSpecCompliantProtocol.HasValue && !this.useSpecCompliantProtocol.Value)
                {
                    return base.TerminationTimeout;
                }

                return TimeSpan.FromMilliseconds(100);
            }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                // Don't call into the ChromiumDriverService base class implementation since those arguments
                // are not supported for Edge Legacy.

                StringBuilder argsBuilder = new StringBuilder(string.Format(CultureInfo.InvariantCulture, "--port={0}", this.Port));
                if (!string.IsNullOrEmpty(this.host))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " --host={0}", this.host));
                }

                if (!string.IsNullOrEmpty(this.package))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " --package={0}", this.package));
                }

                if (this.UseVerboseLogging)
                {
                    argsBuilder.Append(" --verbose");
                }

                if (this.SuppressInitialDiagnosticInformation)
                {
                    argsBuilder.Append(" --silent");
                }

                if (this.useSpecCompliantProtocol.HasValue)
                {
                    if (this.useSpecCompliantProtocol.Value)
                    {
                        argsBuilder.Append(" --w3c");
                    }
                    else
                    {
                        argsBuilder.Append(" --jwp");
                    }
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the EdgeLegacyDriverService.
        /// </summary>
        /// <returns>An EdgeLegacyDriverService that implements default settings.</returns>
        public static EdgeLegacyDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(MicrosoftWebDriverServiceFileName, MicrosoftWebDriverDownloadUrl);
            EdgeLegacyDriverService service = CreateDefaultService(serviceDirectory);
            return service;
        }

        /// <summary>
        /// Creates a default instance of the EdgeLegacyDriverService using a specified path to the EdgeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <returns>An EdgeLegacyDriverService using a random port.</returns>
        public static EdgeLegacyDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, MicrosoftWebDriverServiceFileName);
        }

        /// <summary>
        /// Creates a default instance of the EdgeLegacyDriverService using a specified path to the EdgeDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the EdgeDriver executable file.</param>
        /// <returns>An EdgeLegacyDriverService using a random port.</returns>
        public static EdgeLegacyDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return CreateDefaultService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }

        /// <summary>
        /// Creates a default instance of the EdgeLegacyDriverService using a specified path to the EdgeDriver executable with the given name and listening port.
        /// </summary>
        /// <param name="driverPath">The directory containing the EdgeDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the EdgeDriver executable file</param>
        /// <param name="port">The port number on which the driver will listen</param>
        /// <returns>An EdgeLegacyDriverService using the specified port.</returns>
        public static EdgeLegacyDriverService CreateDefaultService(string driverPath, string driverExecutableFileName, int port)
        {
            return new EdgeLegacyDriverService(driverPath, driverExecutableFileName, port);
        }
    }
}
