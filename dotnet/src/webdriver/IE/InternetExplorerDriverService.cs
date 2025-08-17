// <copyright file="InternetExplorerDriverService.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal;
using System.Globalization;
using System.IO;
using System.Text;

namespace OpenQA.Selenium.IE;

/// <summary>
/// Exposes the service provided by the native <c>IEDriverServer</c> executable.
/// </summary>
public sealed class InternetExplorerDriverService : DriverService
{
    private const string InternetExplorerDriverServiceFileName = "IEDriverServer.exe";

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriverService"/> class.
    /// </summary>
    /// <param name="executablePath">The full path to the <c>IEDriverServer</c> executable.</param>
    /// <param name="executableFileName">The file name of the <c>IEDriverServer</c> executable.</param>
    /// <param name="port">The port on which the <c>IEDriverServer</c> executable should listen.</param>
    private InternetExplorerDriverService(string? executablePath, string? executableFileName, int port)
        : base(executablePath, port, executableFileName)
    {
    }

    /// <inheritdoc />
    protected override DriverOptions GetDefaultDriverOptions()
    {
        return new InternetExplorerOptions();
    }

    /// <summary>
    /// Gets or sets the value of the host adapter on which the <c>IEDriverServer</c> should listen for connections.
    /// </summary>
    public string? Host { get; set; }

    /// <summary>
    /// Gets or sets the location of the log file written to by the <c>IEDriverServer</c>.
    /// </summary>
    public string? LogFile { get; set; }

    /// <summary>
    /// Gets or sets the logging level used by the <c>IEDriverServer</c>. Defaults to <see cref="InternetExplorerDriverLogLevel.Fatal"/>.
    /// </summary>
    public InternetExplorerDriverLogLevel LoggingLevel { get; set; } = InternetExplorerDriverLogLevel.Fatal;

    /// <summary>
    /// Gets or sets the path to which the supporting library of the <c>IEDriverServer.exe</c> is extracted.
    /// Defaults to the temp directory if this property is <see langword="null"/> or <see cref="string.Empty"/>.
    /// </summary>
    /// <remarks>
    /// The <c>IEDriverServer.exe</c> requires extraction of a supporting library to perform some of its functions. Setting
    /// This library is extracted to the temp directory if this property is not set. If the property is set, it must
    /// be set to a valid directory.
    /// </remarks>
    public string? LibraryExtractionPath { get; set; }

    /// <summary>
    /// <para>Gets or sets the comma-delimited list of IP addresses that are approved to connect to this instance of the <c>IEDriverServer</c>.</para>
    /// <para>If <see langword="null"/> or <see cref="string.Empty"/>, only the local loopback address can connect.</para>
    /// </summary>
    public string? WhitelistedIPAddresses { get; set; }

    /// <summary>
    /// Gets the command-line arguments for the driver service.
    /// </summary>
    protected override string CommandLineArguments
    {
        get
        {
            StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
            if (!string.IsNullOrEmpty(this.Host))
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -host={0}", this.Host));
            }

            if (!string.IsNullOrEmpty(this.LogFile))
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -log-file=\"{0}\"", this.LogFile));
            }

            if (!string.IsNullOrEmpty(this.LibraryExtractionPath))
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -extract-path=\"{0}\"", this.LibraryExtractionPath));
            }

            if (this.LoggingLevel != InternetExplorerDriverLogLevel.Fatal)
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -log-level={0}", this.LoggingLevel.ToString().ToUpperInvariant()));
            }

            if (!string.IsNullOrEmpty(this.WhitelistedIPAddresses))
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " -whitelisted-ips={0}", this.WhitelistedIPAddresses));
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
        return new InternetExplorerDriverService(null, null, PortUtilities.FindFreePort());
    }

    /// <summary>
    /// Creates a default instance of the InternetExplorerDriverService using a specified path to the <c>IEDriverServer</c> executable.
    /// </summary>
    /// <param name="driverPath">The path to the executable or the directory containing the <c>IEDriverServer</c> executable.</param>
    /// <returns>A InternetExplorerDriverService using a random port.</returns>
    public static InternetExplorerDriverService CreateDefaultService(string? driverPath)
    {
        if (File.Exists(driverPath))
        {
            string fileName = Path.GetFileName(driverPath);
            string driverFolder = Path.GetDirectoryName(driverPath)!;

            return CreateDefaultService(driverFolder, fileName);
        }
        else
        {
            string fileName = InternetExplorerDriverServiceFileName;
            string? driverFolder = driverPath;

            return CreateDefaultService(driverFolder, fileName);
        }
    }

    /// <summary>
    /// Creates a default instance of the InternetExplorerDriverService using a specified path to the <c>IEDriverServer</c> executable with the given name.
    /// </summary>
    /// <param name="driverPath">The directory containing the <c>IEDriverServer</c> executable.</param>
    /// <param name="driverExecutableFileName">The name of the <c>IEDriverServer</c> executable file.</param>
    /// <returns>A InternetExplorerDriverService using a random port.</returns>
    public static InternetExplorerDriverService CreateDefaultService(string? driverPath, string? driverExecutableFileName)
    {
        return new InternetExplorerDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
    }
}
