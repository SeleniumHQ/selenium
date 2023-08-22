// <copyright file="ChromiumDriverService.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Exposes the service provided by the native ChromiumDriver executable.
    /// </summary>
    public abstract class ChromiumDriverService : DriverService
    {
        private const string DefaultChromeDriverServiceExecutableName = "chromedriver";

        private string logPath = string.Empty;
        private string urlPathPrefix = string.Empty;
        private string portServerAddress = string.Empty;
        private string whitelistedIpAddresses = string.Empty;
        private int adbPort = -1;
        private bool disableBuildCheck;
        private bool enableVerboseLogging;
        private bool enableAppendLog;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the ChromeDriver executable.</param>
        /// <param name="executableFileName">The file name of the ChromeDriver executable.</param>
        /// <param name="port">The port on which the ChromeDriver executable should listen.</param>
        protected ChromiumDriverService(string executablePath, string executableFileName, int port, Uri downloadUrl = null)
            : base(executablePath, port, executableFileName)
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
        /// Gets or sets a value indicating whether to skip version compatibility check
        /// between the driver and the browser.
        /// Defaults to <see langword="false"/>.
        /// </summary>
        public bool DisableBuildCheck
        {
            get { return this.disableBuildCheck; }
            set { this.disableBuildCheck = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to enable verbose logging for the ChromeDriver executable.
        /// Defaults to <see langword="false"/>.
        /// </summary>
        public bool EnableVerboseLogging
        {
            get { return this.enableVerboseLogging; }
            set { this.enableVerboseLogging = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to enable appending to an existing ChromeDriver log file.
        /// Defaults to <see langword="false"/>.
        /// </summary>
        public bool EnableAppendLog
        {
            get { return this.enableAppendLog; }
            set { this.enableAppendLog = value; }
        }

        /// <summary>
        /// Gets or sets the comma-delimited list of IP addresses that are approved to
        /// connect to this instance of the Chrome driver. Defaults to an empty string,
        /// which means only the local loopback address can connect.
        /// </summary>
        public string WhitelistedIPAddresses
        {
            get { return this.whitelistedIpAddresses; }
            set { this.whitelistedIpAddresses = value; }
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

                if (this.disableBuildCheck)
                {
                    argsBuilder.Append(" --disable-build-check");
                }

                if (this.enableVerboseLogging)
                {
                    argsBuilder.Append(" --verbose");
                }

                if (this.enableAppendLog)
                {
                    argsBuilder.Append(" --append-log");
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

                if (!string.IsNullOrEmpty(this.whitelistedIpAddresses))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -whitelisted-ips={0}", this.whitelistedIpAddresses));
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Returns the Chromium driver filename for the currently running platform
        /// </summary>
        /// <param name="fileName">The name of the Chromium executable. Default is "chromedriver".</param>
        /// <returns>The file name of the Chromium driver service executable.</returns>
        protected static string ChromiumDriverServiceFileName(string fileName = DefaultChromeDriverServiceExecutableName)
        {
            // Unfortunately, detecting the currently running platform isn't as
            // straightforward as you might hope.
            // See: http://mono.wikia.com/wiki/Detecting_the_execution_platform
            // and https://msdn.microsoft.com/en-us/library/3a8hyw88(v=vs.110).aspx
            const int PlatformMonoUnixValue = 128;

            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Win32NT:
                case PlatformID.Win32S:
                case PlatformID.Win32Windows:
                case PlatformID.WinCE:
                    fileName += ".exe";
                    break;

                case PlatformID.MacOSX:
                case PlatformID.Unix:
                    break;

                // Don't handle the Xbox case. Let default handle it.
                // case PlatformID.Xbox:
                //     break;
                default:
                    if ((int)Environment.OSVersion.Platform == PlatformMonoUnixValue)
                    {
                        break;
                    }

                    throw new WebDriverException("Unsupported platform: " + Environment.OSVersion.Platform);
            }

            return fileName;
        }
    }
}
