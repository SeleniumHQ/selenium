// <copyright file="WiniumDriverService.cs" company="WebDriver Committers">
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
using System.Text;

using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Winium
{
    using System.Globalization;

    /// <summary>
    /// Exposes the service provided by the native Winium Driver executable.
    /// </summary>
    public class WiniumDriverService : DriverService
    {
        private const string DesktopDriverServiceFileName = "Winium.Desktop.Driver.exe";
        private const string StoreAppsDriverServiceFileName = "Winium.StoreApps.Driver.exe";
        private const string SilverlightDriverServiceFileName = "WindowsPhoneDriver.OuterDriver.exe";

        private static readonly Uri DesktopDriverDownloadUrl = new Uri("https://github.com/2gis/Winium.Desktop/releases");
        private static readonly Uri StoreAppsDriverDownloadUrl = new Uri("https://github.com/2gis/Winium.StoreApps/releases");
        private static readonly Uri SilverlightDriverDownloadUrl = new Uri("https://github.com/2gis/winphonedriver/releases");
        private static readonly Uri WiniumDownloUrl = new Uri("https://github.com/2gis/Winium");

        private string logPath = string.Empty;
        private bool enableVerboseLogging;

        private WiniumDriverService(string executablePath, string executableFileName, int port, Uri downloadUrl)
            : base(executablePath, port, executableFileName, downloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets the location of the log file written to by the Winium Driver executable.
        /// </summary>
        public string LogPath
        {
            get { return this.logPath; }
            set { this.logPath = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to enable verbose logging for the Winium Driver executable.
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
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --log-path={0}", this.logPath);
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Creates a default instance of the WiniumDriverService using a specified path to the Winium Driver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the Winium Driver executable.</param>
        /// <param name="driverExecutableFileName">The name of the Winium Driver executable file.</param>
        /// <returns>A <see cref="WiniumDriverService"/> using a random port.</returns>
        public static WiniumDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new WiniumDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort(), WiniumDownloUrl);
        }

        /// <summary>
        /// Creates a default instance of the WiniumDriverService using a specified path to the Winium Desktop Driver.
        /// </summary>
        /// <param name="driverPath">The directory containing the Winium Desktop Driver executable.</param>
        /// <returns>A <see cref="WiniumDriverService"/> using Winium Deaktop and random port.</returns>
        public static WiniumDriverService CreateDesktopService(string driverPath)
        {
            return new WiniumDriverService(driverPath, DesktopDriverServiceFileName, PortUtilities.FindFreePort(), DesktopDriverDownloadUrl);
        }

        /// <summary>
        /// Creates a default instance of the WiniumDriverService using a specified path to the Winium AtoreApps Driver.
        /// </summary>
        /// <param name="driverPath">The directory containing the Winium StoreApps Driver executable.</param>
        /// <returns>A <see cref="WiniumDriverService"/> using Winium StoreApps and random port.</returns>
        public static WiniumDriverService CreateStoreAppsService(string driverPath)
        {
            return new WiniumDriverService(driverPath, StoreAppsDriverServiceFileName, PortUtilities.FindFreePort(), StoreAppsDriverDownloadUrl);
        }

        /// <summary>
        /// Creates a default instance of the WiniumDriverService using a specified path to the WindowsPhone Driver.
        /// </summary>
        /// <param name="driverPath">The directory containing the WindowsPhone Driver executable.</param>
        /// <returns>A <see cref="WiniumDriverService"/> using WindowsPhone Driver and random port.</returns>
        public static WiniumDriverService CreateSilverlightService(string driverPath)
        {
            return new WiniumDriverService(driverPath, SilverlightDriverServiceFileName, PortUtilities.FindFreePort(), SilverlightDriverDownloadUrl);
        }
    }
}
