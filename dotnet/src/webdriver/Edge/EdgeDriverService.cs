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
using System.Globalization;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Chromium;

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Exposes the service provided by the native WebDriver executable.
    /// </summary>
    public sealed class EdgeDriverService : ChromiumDriverService
    {
        private const string MicrosoftWebDriverServiceFileName = "MicrosoftWebDriver.exe";
        private const string MSEdgeDriverServiceFileName = "msedgedriver";

        private static readonly Uri MicrosoftWebDriverDownloadUrl = new Uri("https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/");

        // Engine switching
        private readonly bool usingChromium;

        // Legacy properties
        private string host;
        private string package;
        private bool? useSpecCompliantProtocol;

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the EdgeDriver executable.</param>
        /// <param name="executableFileName">The file name of the EdgeDriver executable.</param>
        /// <param name="port">The port on which the EdgeDriver executable should listen.</param>
        /// <param name="usingChromium">Whether to use the Legacy or Chromium EdgeDriver executable.</param>
        private EdgeDriverService(string executablePath, string executableFileName, int port, bool usingChromium)
            : base(executablePath, executableFileName, port, MicrosoftWebDriverDownloadUrl)
        {
            this.usingChromium = usingChromium;
        }

        /// <summary>
        /// Gets a value indicating whether the driver service is using Edge Chromium.
        /// </summary>
        public bool UsingChromium
        {
            get { return this.usingChromium; }
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
            get { return this.EnableVerboseLogging; }
            set { this.EnableVerboseLogging = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the <see cref="EdgeDriverService"/> instance
        /// should use the a protocol dialect compliant with the W3C WebDriver Specification.
        /// </summary>
        /// <remarks>
        /// Setting this property to a non-<see langword="null"/> value for driver
        /// executables matched to versions of Windows before the 2018 Fall Creators
        /// Update will result in the driver executable shutting down without
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
                if (this.usingChromium || (this.useSpecCompliantProtocol.HasValue && !this.useSpecCompliantProtocol.Value))
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
                if (this.usingChromium || (this.useSpecCompliantProtocol.HasValue && !this.useSpecCompliantProtocol.Value))
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
                return this.usingChromium ? base.CommandLineArguments : LegacyCommandLineArguments;
            }
        }

        private string LegacyCommandLineArguments
        {
            get
            {
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
        /// Creates an instance of the EdgeDriverService for Edge Chromium.
        /// </summary>
        /// <returns>A EdgeDriverService that implements default settings.</returns>
        public static EdgeDriverService CreateChromiumService()
        {
            return CreateDefaultServiceFromOptions(new EdgeOptions() { UseChromium = true });
        }

        /// <summary>
        /// Creates an instance of the EdgeDriverService for Edge Chromium using a specified path to the WebDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateChromiumService(string driverPath)
        {
            return CreateDefaultServiceFromOptions(driverPath, EdgeDriverServiceFileName(true), new EdgeOptions() { UseChromium = true });
        }

        /// <summary>
        /// Creates an instance of the EdgeDriverService for Edge Chromium using a specified path to the WebDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateChromiumService(string driverPath, string driverExecutableFileName)
        {
            return CreateDefaultServiceFromOptions(driverPath, driverExecutableFileName, new EdgeOptions() { UseChromium = true });
        }

        /// <summary>
        /// Creates an instance of the EdgeDriverService for Edge Chromium using a specified path to the WebDriver executable with the given name and listening port.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file</param>
        /// <param name="port">The port number on which the driver will listen</param>
        /// <returns>A EdgeDriverService using the specified port.</returns>
        public static EdgeDriverService CreateChromiumService(string driverPath, string driverExecutableFileName, int port)
        {
            return CreateDefaultServiceFromOptions(driverPath, driverExecutableFileName, port, new EdgeOptions() { UseChromium = true });
        }


        /// <summary>
        /// Creates a default instance of the EdgeDriverService.
        /// </summary>
        /// <returns>A EdgeDriverService that implements default settings.</returns>
        public static EdgeDriverService CreateDefaultService()
        {
            return CreateDefaultServiceFromOptions(new EdgeOptions());
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultServiceFromOptions(driverPath, EdgeDriverServiceFileName(false), new EdgeOptions());
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return CreateDefaultServiceFromOptions(driverPath, driverExecutableFileName, new EdgeOptions());
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable with the given name and listening port.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file</param>
        /// <param name="port">The port number on which the driver will listen</param>
        /// <returns>A EdgeDriverService using the specified port.</returns>
        public static EdgeDriverService CreateDefaultService(string driverPath, string driverExecutableFileName, int port)
        {
            return CreateDefaultServiceFromOptions(driverPath, driverExecutableFileName, port, new EdgeOptions());
        }


        /// <summary>
        /// Creates a default instance of the EdgeDriverService.
        /// </summary>
        /// <param name="options">An <see cref="EdgeOptions"/> object containing options for the service.</param>
        /// <returns>A EdgeDriverService that implements default settings.</returns>
        public static EdgeDriverService CreateDefaultServiceFromOptions(EdgeOptions options)
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(EdgeDriverServiceFileName(options.UseChromium), MicrosoftWebDriverDownloadUrl);
            return CreateDefaultServiceFromOptions(serviceDirectory, options);
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="options">An <see cref="EdgeOptions"/> object containing options for the service.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultServiceFromOptions(string driverPath, EdgeOptions options)
        {
            return CreateDefaultServiceFromOptions(driverPath, EdgeDriverServiceFileName(options.UseChromium), options);
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file.</param>
        /// <param name="options">An <see cref="EdgeOptions"/> object containing options for the service.</param>
        /// <returns>A EdgeDriverService using a random port.</returns>
        public static EdgeDriverService CreateDefaultServiceFromOptions(string driverPath, string driverExecutableFileName, EdgeOptions options)
        {
            return CreateDefaultServiceFromOptions(driverPath, driverExecutableFileName, PortUtilities.FindFreePort(), options);
        }

        /// <summary>
        /// Creates a default instance of the EdgeDriverService using a specified path to the WebDriver executable with the given name and listening port.
        /// </summary>
        /// <param name="driverPath">The directory containing the WebDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the WebDriver executable file</param>
        /// <param name="port">The port number on which the driver will listen</param>
        /// <param name="options">An <see cref="EdgeOptions"/> object containing options for the service.</param>
        /// <returns>A EdgeDriverService using the specified port.</returns>
        public static EdgeDriverService CreateDefaultServiceFromOptions(string driverPath, string driverExecutableFileName, int port, EdgeOptions options)
        {
            return new EdgeDriverService(driverPath, driverExecutableFileName, port, options.UseChromium);
        }

        private static string EdgeDriverServiceFileName(bool useChromium)
        {
            return useChromium ? ChromiumDriverServiceFileName(MSEdgeDriverServiceFileName) : MicrosoftWebDriverServiceFileName;
        }
    }
}
