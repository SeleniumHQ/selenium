// <copyright file="FirefoxDriverService.cs" company="Selenium Committers">
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
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Firefox;

/// <summary>
/// Exposes the service provided by the native FirefoxDriver executable.
/// </summary>
public sealed class FirefoxDriverService : DriverService
{
    private const string DefaultFirefoxDriverServiceFileName = "geckodriver";

    /// <summary>
    /// Process management fields for the log writer.
    /// </summary>
    private StreamWriter? logWriter;

    /// <summary>
    /// Initializes a new instance of the <see cref="FirefoxDriverService"/> class.
    /// </summary>
    /// <param name="executablePath">The full path to the Firefox driver executable.</param>
    /// <param name="executableFileName">The file name of the Firefox driver executable.</param>
    /// <param name="port">The port on which the Firefox driver executable should listen.</param>
    private FirefoxDriverService(string? executablePath, string? executableFileName, int port)
        : base(executablePath, port, executableFileName)
    {
    }

    /// <inheritdoc />
    protected override DriverOptions GetDefaultDriverOptions()
    {
        return new FirefoxOptions();
    }

    /// <summary>
    /// Gets or sets the location of the Firefox binary executable.
    /// </summary>
    /// <remarks> A <see langword="null"/> or <see cref="string.Empty"/> value indicates no binary executable path to specify.</remarks>
    public string? FirefoxBinaryPath { get; set; }

    /// <summary>
    /// Gets or sets the port used by the driver executable to communicate with the browser.
    /// </summary>
    /// <remarks>A negative or zero value indicates no port value to specify.</remarks>
    public int BrowserCommunicationPort { get; set; } = -1;

    /// <summary>
    /// Gets or sets the value of the IP address of the host adapter used by the driver
    /// executable to communicate with the browser.
    /// </summary>
    /// <remarks> A <see langword="null"/> or <see cref="string.Empty"/> value indicates no marionette host adapter to specify.</remarks>
    public string? BrowserCommunicationHost { get; set; }

    /// <summary>
    /// Gets or sets the value of the IP address of the host adapter on which the
    /// service should listen for connections.
    /// </summary>
    /// <remarks> A <see langword="null"/> or <see cref="string.Empty"/> value indicates no host to specify.</remarks>
    public string? Host { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to connect to an already-running
    /// instance of Firefox.
    /// </summary>
    public bool ConnectToRunningBrowser { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to open the Firefox Browser Toolbox
    /// when Firefox is launched.
    /// </summary>
    public bool OpenBrowserToolbox { get; set; }

    /// <summary>
    /// Gets or sets the file path where log output should be written.
    /// </summary>
    /// <remarks>
    /// A <see langword="null"/> or <see cref="string.Empty"/> value indicates no log file to specify.
    /// This approach takes the process output and redirects it to a file because GeckoDriver does not
    /// offer a way to specify a log file path directly.
    /// </remarks>
    public string? LogPath { get; set; }

    /// <summary>
    /// Gets or sets the level at which log output is displayed.
    /// </summary>
    /// <remarks>
    /// This is largely equivalent to setting the <see cref="FirefoxOptions.LogLevel"/>
    /// property, except the log level is set when the driver launches, instead of
    /// when the browser is launched, meaning that initial driver logging before
    /// initiation of a session can be controlled.
    /// </remarks>
    public FirefoxDriverLogLevel LogLevel { get; set; } = FirefoxDriverLogLevel.Default;

    /// <summary>
    /// Gets a value indicating the time to wait for the service to terminate before forcing it to terminate.
    /// </summary>
    protected override TimeSpan TerminationTimeout
    {
        // Use a very small timeout for terminating the Firefox driver,
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
        // The Firefox driver executable does not have a clean shutdown command,
        // which means we have to kill the process.
        get => false;
    }

    /// <summary>
    /// Gets the command-line arguments for the driver service.
    /// </summary>
    protected override string CommandLineArguments
    {
        get
        {
            StringBuilder argsBuilder = new StringBuilder();
            if (this.ConnectToRunningBrowser)
            {
                argsBuilder.Append(" --connect-existing");
            }
            else
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " --websocket-port {0}", PortUtilities.FindFreePort()));
            }

            if (this.BrowserCommunicationPort > 0)
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --marionette-port {0}", this.BrowserCommunicationPort);
            }

            if (!string.IsNullOrEmpty(this.BrowserCommunicationHost))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --marionette-host \"{0}\"", this.BrowserCommunicationHost);
            }

            if (this.Port > 0)
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --port {0}", this.Port);
            }

            if (!string.IsNullOrEmpty(this.FirefoxBinaryPath))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --binary \"{0}\"", this.FirefoxBinaryPath);
            }

            if (!string.IsNullOrEmpty(this.Host))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --host \"{0}\"", this.Host);
            }

            if (this.LogLevel != FirefoxDriverLogLevel.Default)
            {
                argsBuilder.Append(string.Format(CultureInfo.InvariantCulture, " --log {0}", this.LogLevel.ToString().ToLowerInvariant()));
            }

            if (this.OpenBrowserToolbox)
            {
                argsBuilder.Append(" --jsdebugger");
            }

            return argsBuilder.ToString().Trim();
        }
    }

    /// <summary>
    /// Handles the event when the driver service process is starting.
    /// </summary>
    /// <param name="eventArgs">The event arguments containing information about the driver service process.</param>
    /// <remarks>
    /// This method initializes a log writer if a log path is specified and redirects output streams to capture logs.
    /// </remarks>
    protected override void OnDriverProcessStarting(DriverProcessStartingEventArgs eventArgs)
    {
        if (!string.IsNullOrEmpty(this.LogPath))
        {
            string? directory = Path.GetDirectoryName(this.LogPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Initialize the log writer
            logWriter = new StreamWriter(this.LogPath, append: true) { AutoFlush = true };

            // Configure process to redirect output
            eventArgs.DriverServiceProcessStartInfo.RedirectStandardOutput = true;
            eventArgs.DriverServiceProcessStartInfo.RedirectStandardError = true;
        }

        base.OnDriverProcessStarting(eventArgs);
    }

    /// <summary>
    /// Handles the event when the driver process has started.
    /// </summary>
    /// <param name="eventArgs">The event arguments containing information about the started driver process.</param>
    /// <remarks>
    /// This method reads the output and error streams asynchronously and writes them to the log file if available.
    /// </remarks>
    protected override void OnDriverProcessStarted(DriverProcessStartedEventArgs eventArgs)
    {
        if (logWriter == null) return;
        if (eventArgs.StandardOutputStreamReader != null)
        {
            _ = Task.Run(() => ReadStreamAsync(eventArgs.StandardOutputStreamReader));
        }

        if (eventArgs.StandardErrorStreamReader != null)
        {
            _ = Task.Run(() => ReadStreamAsync(eventArgs.StandardErrorStreamReader));
        }

        base.OnDriverProcessStarted(eventArgs);
    }

    /// <summary>
    /// Disposes of the resources used by the <see cref="FirefoxDriverService"/> instance.
    /// </summary>
    /// <param name="disposing">A value indicating whether the method is being called from Dispose.</param>
    /// <remarks>
    /// If disposing is true, it disposes of the log writer if it exists.
    /// </remarks>
    protected override void Dispose(bool disposing)
    {
        if (logWriter != null && disposing)
        {
            logWriter.Dispose();
            logWriter = null;
        }

        base.Dispose(disposing);
    }

    /// <summary>
    /// Creates a default instance of the FirefoxDriverService.
    /// </summary>
    /// <returns>A FirefoxDriverService that implements default settings.</returns>
    public static FirefoxDriverService CreateDefaultService()
    {
        return new FirefoxDriverService(null, null, PortUtilities.FindFreePort());
    }


    /// <summary>
    /// Creates a default instance of the FirefoxDriverService using a specified path to the Firefox driver executable.
    /// </summary>
    /// <param name="driverPath">The path to the executable or the directory containing the Firefox driver executable.</param>
    /// <returns>A FirefoxDriverService using a random port.</returns>
    public static FirefoxDriverService CreateDefaultService(string? driverPath)
    {
        if (File.Exists(driverPath))
        {
            string fileName = Path.GetFileName(driverPath);
            string driverFolder = Path.GetDirectoryName(driverPath)!;

            return CreateDefaultService(driverFolder, fileName);
        }
        else
        {
            string fileName = FirefoxDriverServiceFileName();
            string? driverFolder = driverPath;

            return CreateDefaultService(driverFolder, fileName);
        }
    }

    /// <summary>
    /// Creates a default instance of the FirefoxDriverService using a specified path to the Firefox driver executable with the given name.
    /// </summary>
    /// <param name="driverPath">The directory containing the Firefox driver executable.</param>
    /// <param name="driverExecutableFileName">The name of the Firefox driver executable file.</param>
    /// <returns>A FirefoxDriverService using a random port.</returns>
    public static FirefoxDriverService CreateDefaultService(string? driverPath, string? driverExecutableFileName)
    {
        return new FirefoxDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
    }

    /// <summary>
    /// Returns the Firefox driver filename for the currently running platform
    /// </summary>
    /// <returns>The file name of the Firefox driver service executable.</returns>
    private static string FirefoxDriverServiceFileName()
    {
        string fileName = DefaultFirefoxDriverServiceFileName;

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

    private async Task ReadStreamAsync(StreamReader reader)
    {
        try
        {
            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                if (logWriter != null)
                {
                    logWriter.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {line}");
                }
            }
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            System.Diagnostics.Debug.WriteLine($"Error reading stream: {ex.Message}");
        }
    }
}
