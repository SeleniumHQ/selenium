// <copyright file="SafariDriverService.cs" company="Selenium Committers">
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
using System;
using System.IO;
using System.Text;

namespace OpenQA.Selenium.Safari;

/// <summary>
/// Exposes the service provided by the native SafariDriver executable.
/// </summary>
public sealed class SafariDriverService : DriverService
{
    private const string DefaultSafariDriverServiceExecutableName = "safaridriver";

    /// <summary>
    /// Enable diagnose logging.
    /// When set to <see langword="true"/>, the <b>SafariDriver</b> will be started with the <i>--diagnose</i> flag.
    /// Logs will be written to <i>~/Library/Logs/com.apple.WebDriver/</i>.
    /// </summary>
    public bool? Diagnose { get; set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="SafariDriverService"/> class.
    /// </summary>
    /// <param name="executablePath">The directory of the SafariDriver executable.</param>
    /// <param name="executableFileName">The file name of the SafariDriver executable.</param>
    /// <param name="port">The port on which the SafariDriver executable should listen.</param>
    private SafariDriverService(string? executablePath, string? executableFileName, int port)
        : base(executablePath, port, executableFileName)
    {
    }

    /// <inheritdoc />
    protected override DriverOptions GetDefaultDriverOptions()
    {
        return new SafariOptions();
    }

    /// <summary>
    /// Gets the command-line arguments for the driver service.
    /// </summary>
    protected override string CommandLineArguments
    {
        get
        {
            StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);

            if (this.Diagnose is true)
            {
                argsBuilder.Append(" --diagnose");
            }

            return argsBuilder.ToString();
        }
    }

    /// <summary>
    /// Gets a value indicating the time to wait for the service to terminate before forcing it to terminate.
    /// For the Safari driver, there is no time for termination
    /// </summary>
    protected override TimeSpan TerminationTimeout
    {
        // Use a very small timeout for terminating the Safari driver,
        // because the executable does not have a clean shutdown command,
        // which means we have to kill the process. Using a short timeout
        // gets us to the termination point much faster.
        get => TimeSpan.FromMilliseconds(100);
    }

    /// <summary>
    /// Gets a value indicating whether the service has a shutdown API that can be called to terminate
    /// it gracefully before forcing a termination.
    /// </summary>
    protected override bool HasShutdown
    {
        // The Safari driver executable does not have a clean shutdown command,
        // which means we have to kill the process.
        get => false;
    }

    /// <summary>
    /// Creates a default instance of the SafariDriverService.
    /// </summary>
    /// <returns>A SafariDriverService that implements default settings.</returns>
    public static SafariDriverService CreateDefaultService()
    {
        return new SafariDriverService(null, null, PortUtilities.FindFreePort());
    }

    /// <summary>
    /// Creates a default instance of the SafariDriverService using a specified path to the SafariDriver executable.
    /// </summary>
    /// <param name="driverPath">The path to the executable or the directory containing the SafariDriver executable.</param>
    /// <returns>A SafariDriverService using a random port.</returns>
    public static SafariDriverService CreateDefaultService(string? driverPath)
    {
        if (File.Exists(driverPath))
        {
            string fileName = Path.GetFileName(driverPath);
            string driverFolder = Path.GetDirectoryName(driverPath)!;

            return CreateDefaultService(driverFolder, fileName);
        }
        else
        {
            string fileName = DefaultSafariDriverServiceExecutableName;
            string? driverFolder = driverPath;

            return CreateDefaultService(driverFolder, fileName);
        }
    }

    /// <summary>
    /// Creates a default instance of the SafariDriverService using a specified path to the SafariDriver executable with the given name.
    /// </summary>
    /// <param name="driverPath">The directory containing the SafariDriver executable.</param>
    /// <param name="driverExecutableFileName">The name of the SafariDriver executable file.</param>
    /// <returns>A SafariDriverService using a random port.</returns>
    public static SafariDriverService CreateDefaultService(string? driverPath, string? driverExecutableFileName)
    {
        return new SafariDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
    }
}
