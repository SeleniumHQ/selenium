// <copyright file="ChromiumDriverService.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium.Chromium;

/// <summary>
/// Exposes the service provided by the native ChromiumDriver executable.
/// </summary>
public abstract class ChromiumDriverService : DriverService
{
    private const string DefaultChromeDriverServiceExecutableName = "chromedriver";

    /// <summary>
    /// Initializes a new instance of the <see cref="ChromiumDriverService"/> class.
    /// </summary>
    /// <param name="executablePath">The full path to the ChromeDriver executable.</param>
    /// <param name="executableFileName">The file name of the ChromeDriver executable.</param>
    /// <param name="port">The port on which the ChromeDriver executable should listen.</param>
    protected ChromiumDriverService(string? executablePath, string? executableFileName, int port)
        : base(executablePath, port, executableFileName)
    {
    }

    /// <summary>
    /// <para>Gets or sets the location of the log file written to by the ChromeDriver executable.</para>
    /// <para><see langword="null"/> or <see cref="string.Empty"/> signify no log path.</para>
    /// </summary>
    public string? LogPath { get; set; }

    /// <summary>
    /// <para>Gets or sets the base URL path prefix for commands (e.g., "wd/url").</para>
    /// <para><see langword="null"/> or <see cref="string.Empty"/> signify no prefix.</para>
    /// </summary>
    public string? UrlPathPrefix { get; set; }

    /// <summary>
    /// <para>Gets or sets the address of a server to contact for reserving a port.</para>
    /// <para><see langword="null"/> or <see cref="string.Empty"/> signify no port server.</para>
    /// </summary>
    public string? PortServerAddress { get; set; }

    /// <summary>
    /// <para>Gets or sets the port on which the Android Debug Bridge is listening for commands.</para>
    /// <para>A value less than or equal to 0, or <see langword="null"/>, indicates no Android Debug Bridge specified.</para>
    /// </summary>
    public int? AndroidDebugBridgePort { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to skip version compatibility check
    /// between the driver and the browser.
    /// Defaults to <see langword="false"/>.
    /// </summary>
    public bool DisableBuildCheck { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to enable verbose logging for the ChromeDriver executable.
    /// Defaults to <see langword="false"/>.
    /// </summary>
    public bool EnableVerboseLogging { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to enable appending to an existing ChromeDriver log file.
    /// Defaults to <see langword="false"/>.
    /// </summary>
    public bool EnableAppendLog { get; set; }

    /// <summary>
    /// Gets or sets the level at which log output is displayed.
    /// </summary>
    public ChromiumDriverLogLevel LogLevel { get; set; } = ChromiumDriverLogLevel.Default;

    /// <summary>
    /// <para>Gets or sets the comma-delimited list of IP addresses that are approved to connect to this instance of the Chrome driver.</para>
    /// <para>A value of <see langword="null"/> or <see cref="string.Empty"/> means only the local loopback address can connect.</para>
    /// </summary>
    [Obsolete($"Use {nameof(AllowedIPAddresses)}")]
    public string? WhitelistedIPAddresses
    {
        get => this.AllowedIPAddresses;
        set => this.AllowedIPAddresses = value;
    }

    /// <summary>
    /// <para>Gets or sets the comma-delimited list of IP addresses that are approved to connect to this instance of the Chrome driver.</para>
    /// <para>A value of <see langword="null"/> or <see cref="string.Empty"/> means only the local loopback address can connect.</para>
    /// </summary>
    public string? AllowedIPAddresses { get; set; }

    /// <summary>
    /// Gets the command-line arguments for the driver service.
    /// </summary>
    protected override string CommandLineArguments
    {
        get
        {
            StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
            if (this.AndroidDebugBridgePort is int adb && adb > 0)
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --adb-port={0}", adb);
            }

            if (this.SuppressInitialDiagnosticInformation)
            {
                argsBuilder.Append(" --silent");
            }

            if (this.DisableBuildCheck)
            {
                argsBuilder.Append(" --disable-build-check");
            }

            if (this.EnableVerboseLogging)
            {
                argsBuilder.Append(" --verbose");
            }

            if (this.EnableAppendLog)
            {
                argsBuilder.Append(" --append-log");
            }

            if (!string.IsNullOrEmpty(this.LogPath))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --log-path=\"{0}\"", this.LogPath);
            }

            if (!string.IsNullOrEmpty(this.UrlPathPrefix))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --url-base={0}", this.UrlPathPrefix);
            }

            if (!string.IsNullOrEmpty(this.PortServerAddress))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --port-server={0}", this.PortServerAddress);
            }

            if (!string.IsNullOrEmpty(this.AllowedIPAddresses))
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -allowed-ips={0}", this.AllowedIPAddresses));
            }

            if (this.LogLevel != ChromiumDriverLogLevel.Default)
            {
                if (Enum.IsDefined(typeof(ChromiumDriverLogLevel), this.LogLevel))
                {
                    argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " --log-level={0}", this.LogLevel.ToString().ToUpperInvariant()));
                }
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
        const PlatformID PlatformIDMonoUnix = (PlatformID)128;

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
            case PlatformIDMonoUnix:
                break;

            // Don't handle the Xbox case. Let default handle it.
            // case PlatformID.Xbox:
            //     break;

            default:
                throw new WebDriverException("Unsupported platform: " + Environment.OSVersion.Platform);
        }

        return fileName;
    }
}
