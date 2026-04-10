// <copyright file="DriverService.cs" company="Selenium Committers">
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

using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium;

/// <summary>
/// Exposes the service provided by a native WebDriver server executable.
/// </summary>
public abstract class DriverService : IDisposable, IAsyncDisposable
{
    private static readonly ILogger _logger = Log.GetLogger<DriverService>();
    private bool isDisposed;
    private Process? driverServiceProcess;

    /// <summary>
    /// Initializes a new instance of the <see cref="DriverService"/> class.
    /// </summary>
    /// <param name="servicePath">The full path to the directory containing the executable providing the service to drive the browser.</param>
    /// <param name="port">The port on which the driver executable should listen.</param>
    /// <param name="driverServiceExecutableName">The file name of the driver service executable.</param>
    /// <exception cref="ArgumentException">
    /// If the path specified is <see langword="null"/> or an empty string.
    /// </exception>
    /// <exception cref="DriverServiceNotFoundException">
    /// If the specified driver service executable does not exist in the specified directory.
    /// </exception>
    protected DriverService(string? servicePath, int port, string? driverServiceExecutableName)
    {
        this.DriverServicePath = servicePath;
        this.DriverServiceExecutableName = driverServiceExecutableName;
        this.Port = port;
    }

    /// <summary>
    /// Occurs when the driver process is starting.
    /// </summary>
    public event EventHandler<DriverProcessStartingEventArgs>? DriverProcessStarting;

    /// <summary>
    /// Occurs when the driver process has completely started.
    /// </summary>
    public event EventHandler<DriverProcessStartedEventArgs>? DriverProcessStarted;

    /// <summary>
    /// Gets the Uri of the service.
    /// </summary>
    public Uri ServiceUrl
    {
        get
        {
            string url = string.Format(CultureInfo.InvariantCulture, "http://{0}:{1}", this.HostName, this.Port);
            return new Uri(url);
        }
    }

    /// <summary>
    /// Gets or sets the host name of the service. Defaults to "localhost."
    /// </summary>
    /// <remarks>
    /// Most driver service executables do not allow connections from remote
    /// (non-local) machines. This property can be used as a workaround so
    /// that an IP address (like "127.0.0.1" or "::1") can be used instead.
    /// </remarks>
    public string HostName { get; set; } = "localhost";

    /// <summary>
    /// Gets or sets the port of the service.
    /// </summary>
    public int Port { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the initial diagnostic information is suppressed
    /// when starting the driver server executable. Defaults to <see langword="false"/>, meaning
    /// diagnostic information should be shown by the driver server executable.
    /// </summary>
    public bool SuppressInitialDiagnosticInformation { get; set; }

    /// <summary>
    /// Gets a value indicating whether the service is running.
    /// </summary>
    [MemberNotNullWhen(true, nameof(driverServiceProcess))]
    public bool IsRunning => this.driverServiceProcess != null && !this.driverServiceProcess.HasExited;

    /// <summary>
    /// Gets or sets a value indicating whether the command prompt window of the service should be hidden.
    /// </summary>
    public bool HideCommandPromptWindow { get; set; } = true;

    /// <summary>
    /// Gets the process ID of the running driver service executable. Returns 0 if the process is not running.
    /// </summary>
    public int ProcessId
    {
        get
        {
            if (this.IsRunning)
            {
                // There's a slight chance that the Process object is running,
                // but does not have an ID set. This should be rare, but we
                // definitely don't want to throw an exception.
                try
                {
                    return this.driverServiceProcess.Id;
                }
                catch (InvalidOperationException)
                {
                }
            }

            return 0;
        }
    }

    /// <summary>
    /// Gets or sets a value indicating the time to wait for an initial connection before timing out.
    /// </summary>
    public TimeSpan InitializationTimeout { get; set; } = TimeSpan.FromSeconds(20);

    /// <summary>
    /// Gets or sets the executable file name of the driver service.
    /// </summary>
    public string? DriverServiceExecutableName { get; set; }

    /// <summary>
    /// Gets or sets the path of the driver service.
    /// </summary>
    public string? DriverServicePath { get; set; }

    /// <summary>
    /// Gets the command-line arguments for the driver service.
    /// </summary>
    protected virtual string CommandLineArguments => string.Format(CultureInfo.InvariantCulture, "--port={0}", this.Port);

    /// <summary>
    /// Gets a value indicating the time to wait for the service to terminate before forcing it to terminate.
    /// </summary>
    protected virtual TimeSpan TerminationTimeout => TimeSpan.FromSeconds(10);

    /// <summary>
    /// Gets a value indicating whether the service has a shutdown API that can be called to terminate
    /// it gracefully before forcing a termination.
    /// </summary>
    protected virtual bool HasShutdown => true;

    /// <summary>
    /// Gets a value indicating whether process redirection is enforced regardless of other settings.
    /// </summary>
    /// <remarks>Set this property to <see langword="true"/> to force all process output and error streams to
    /// be redirected, even if redirection is not required by default behavior. This can be useful in scenarios where
    /// capturing process output is necessary for logging or analysis.</remarks>
    protected virtual internal bool EnableProcessRedirection =>
        Environment.GetEnvironmentVariable("SE_DEBUG") is not null;

    /// <summary>
    /// Releases all resources associated with this <see cref="DriverService"/>.
    /// </summary>
    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Asynchronously releases all resources associated with this <see cref="DriverService"/>.
    /// </summary>
    /// <returns>A task that represents the asynchronous dispose operation.</returns>
    public async ValueTask DisposeAsync()
    {
        await this.DisposeAsync(true).ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Starts the driver service if it is not already running.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>A task that represents the asynchronous start operation.</returns>
    /// <exception cref="InvalidOperationException">If the driver service path is specified but the driver service executable name is not.</exception>
    /// <exception cref="WebDriverException">If the service fails to initialize within the timeout period or exits unexpectedly.</exception>
    /// <exception cref="OperationCanceledException">If the operation is cancelled via the cancellation token.</exception>
    [MemberNotNull(nameof(driverServiceProcess))]
    public async ValueTask StartAsync(CancellationToken cancellationToken = default)
    {
        if (this.driverServiceProcess != null)
        {
            return;
        }

        this.driverServiceProcess = new Process();

        if (this.DriverServicePath != null)
        {
            if (this.DriverServiceExecutableName is null)
            {
                throw new InvalidOperationException("If the driver service path is specified, the driver service executable name must be as well");
            }

            this.driverServiceProcess.StartInfo.FileName = Path.Combine(this.DriverServicePath, this.DriverServiceExecutableName);
        }
        else
        {
            var driverFinder = new DriverFinder(this.GetDefaultDriverOptions());
            var driverPath = await driverFinder.GetDriverPathAsync(cancellationToken).ConfigureAwait(false);
            this.driverServiceProcess.StartInfo.FileName = driverPath;
        }

        this.driverServiceProcess.StartInfo.Arguments = this.CommandLineArguments;
        this.driverServiceProcess.StartInfo.UseShellExecute = false;
        this.driverServiceProcess.StartInfo.CreateNoWindow = this.HideCommandPromptWindow;

        this.driverServiceProcess.StartInfo.RedirectStandardOutput = true;
        this.driverServiceProcess.StartInfo.RedirectStandardError = true;

        if (this.EnableProcessRedirection)
        {
            this.driverServiceProcess.OutputDataReceived += this.OnDriverProcessDataReceived;
            this.driverServiceProcess.ErrorDataReceived += this.OnDriverProcessDataReceived;
        }

        DriverProcessStartingEventArgs eventArgs = new DriverProcessStartingEventArgs(this.driverServiceProcess.StartInfo);
        this.OnDriverProcessStarting(eventArgs);

        this.driverServiceProcess.Start();

        // Important: Start the process and immediately begin reading the output and error streams to avoid IO deadlocks.
        this.driverServiceProcess.BeginOutputReadLine();
        this.driverServiceProcess.BeginErrorReadLine();

        await this.WaitForServiceInitializationAsync(cancellationToken).ConfigureAwait(false);

        DriverProcessStartedEventArgs processStartedEventArgs = new DriverProcessStartedEventArgs(this.driverServiceProcess);
        this.OnDriverProcessStarted(processStartedEventArgs);
    }

    /// <summary>
    /// The browser options instance that corresponds to the driver service
    /// </summary>
    /// <returns></returns>
    protected abstract DriverOptions GetDefaultDriverOptions();

    /// <summary>
    /// Releases all resources associated with this <see cref="DriverService"/>.
    /// </summary>
    /// <param name="disposing"><see langword="true"/> if the Dispose method was explicitly called; otherwise, <see langword="false"/>.</param>
    protected virtual void Dispose(bool disposing)
    {
        if (!this.isDisposed)
        {
            if (disposing)
            {
                if (EnableProcessRedirection && this.driverServiceProcess is not null)
                {
                    this.driverServiceProcess.OutputDataReceived -= this.OnDriverProcessDataReceived;
                    this.driverServiceProcess.ErrorDataReceived -= this.OnDriverProcessDataReceived;
                }

                this.StopAsync().GetAwaiter().GetResult();
            }

            this.isDisposed = true;
        }
    }

    /// <summary>
    /// Asynchronously releases all resources associated with this <see cref="DriverService"/>.
    /// </summary>
    /// <param name="disposing"><see langword="true"/> if the DisposeAsync method was explicitly called; otherwise, <see langword="false"/>.</param>
    /// <returns>A task that represents the asynchronous dispose operation.</returns>
    protected virtual async ValueTask DisposeAsync(bool disposing)
    {
        if (!this.isDisposed)
        {
            if (disposing)
            {
                if (EnableProcessRedirection && this.driverServiceProcess is not null)
                {
                    this.driverServiceProcess.OutputDataReceived -= this.OnDriverProcessDataReceived;
                    this.driverServiceProcess.ErrorDataReceived -= this.OnDriverProcessDataReceived;
                }

                await this.StopAsync().ConfigureAwait(false);
            }

            this.isDisposed = true;
        }
    }

    /// <summary>
    /// Raises the <see cref="DriverProcessStarting"/> event.
    /// </summary>
    /// <param name="eventArgs">A <see cref="DriverProcessStartingEventArgs"/> that contains the event data.</param>
    protected virtual void OnDriverProcessStarting(DriverProcessStartingEventArgs eventArgs)
    {
        if (eventArgs == null)
        {
            throw new ArgumentNullException(nameof(eventArgs), "eventArgs must not be null");
        }

        this.DriverProcessStarting?.Invoke(this, eventArgs);
    }

    /// <summary>
    /// Raises the <see cref="DriverProcessStarted"/> event.
    /// </summary>
    /// <param name="eventArgs">A <see cref="DriverProcessStartedEventArgs"/> that contains the event data.</param>
    protected virtual void OnDriverProcessStarted(DriverProcessStartedEventArgs eventArgs)
    {
        if (eventArgs == null)
        {
            throw new ArgumentNullException(nameof(eventArgs), "eventArgs must not be null");
        }

        this.DriverProcessStarted?.Invoke(this, eventArgs);
    }

    /// <summary>
    /// Handles the output and error data received from the driver process.
    /// </summary>
    /// <param name="sender">The sender of the event.</param>
    /// <param name="args">The data received event arguments.</param>
    protected virtual void OnDriverProcessDataReceived(object sender, DataReceivedEventArgs args)
    {
        if (Environment.GetEnvironmentVariable("SE_DEBUG") is not null && !string.IsNullOrEmpty(args.Data))
        {
            Console.Error.WriteLine(args.Data);
        }
    }

    private async ValueTask StopAsync()
    {
        if (!this.IsRunning)
        {
            return;
        }

        var process = this.driverServiceProcess;
        using var timeoutCts = new CancellationTokenSource(this.TerminationTimeout);

        try
        {
            // Send graceful shutdown signal
            _ = SendShutdownSignalAsync(process, timeoutCts.Token);

            // Wait for process to exit
            await WaitForProcessExitAsync(process, timeoutCts.Token).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
        {
            // Timeout occurred, force kill
            if (_logger.IsEnabled(LogEventLevel.Warn))
            {
                _logger.Warn($"Driver service did not exit within {this.TerminationTimeout.TotalSeconds} seconds. Forcing termination.");
            }

            TryKillProcess(process);
        }
        catch (InvalidOperationException)
        {
            // Process already exited or is in an invalid state, which is acceptable during shutdown
        }
        finally
        {
            process.Dispose();
            this.driverServiceProcess = null;
        }
    }

    private static async Task WaitForProcessExitAsync(Process process, CancellationToken cancellationToken)
    {
        // Early exit if process already exited
        if (process.HasExited)
        {
            return;
        }

        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);

        void OnProcessExited(object? sender, EventArgs e) => tcs.TrySetResult(true);

        try
        {
            process.EnableRaisingEvents = true;
            process.Exited += OnProcessExited;

            // Check again after attaching handler to avoid race condition
            if (process.HasExited)
            {
                return;
            }

            using (cancellationToken.Register(() => tcs.TrySetCanceled(cancellationToken)))
            {
                await tcs.Task.ConfigureAwait(false);
            }
        }
        finally
        {
            process.Exited -= OnProcessExited;
        }
    }

    private async Task SendShutdownSignalAsync(Process process, CancellationToken cancellationToken)
    {
        try
        {
            if (HasShutdown)
            {
                Uri shutdownUrl = new(this.ServiceUrl, "/shutdown");
                using var httpClient = new HttpClient();
                using var _ = await httpClient.GetAsync(shutdownUrl, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                TryKillProcess(process);
            }
        }
        catch (HttpRequestException ex)
        {
            if (_logger.IsEnabled(LogEventLevel.Debug))
            {
                _logger.Debug($"Failed to send shutdown signal: {ex.Message}");
            }
        }
        catch (OperationCanceledException ex)
        {
            if (_logger.IsEnabled(LogEventLevel.Debug))
            {
                _logger.Debug($"Shutdown request was cancelled: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            // Catch any unexpected exceptions to prevent unobserved task exceptions
            if (_logger.IsEnabled(LogEventLevel.Debug))
            {
                _logger.Debug($"Unexpected error during shutdown signal: {ex.Message}");
            }
        }
    }

    private void TryKillProcess(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
        catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception)
        {
            if (_logger.IsEnabled(LogEventLevel.Debug))
            {
                _logger.Debug($"Failed to kill process: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Waits until the service is initialized, or the timeout set
    /// by the <see cref="InitializationTimeout"/> property is reached.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the service to initialize.</param>
    /// <exception cref="WebDriverException">If the service fails to start within the timeout period.</exception>
    private async Task WaitForServiceInitializationAsync(CancellationToken cancellationToken = default)
    {
        using var timeoutCts = new CancellationTokenSource(this.InitializationTimeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.ConnectionClose = true;

        Uri serviceHealthUri = new(this.ServiceUrl, new Uri(DriverCommand.Status, UriKind.Relative));

        try
        {
            while (true)
            {
                linkedCts.Token.ThrowIfCancellationRequested();

                // If the driver service process has exited, we can exit early.
                if (!this.IsRunning)
                {
                    throw new WebDriverException($"Driver service process exited unexpectedly before initialization completed. Service URL: {this.ServiceUrl}");
                }

                try
                {
                    using var response = await httpClient.GetAsync(serviceHealthUri, linkedCts.Token).ConfigureAwait(false);

                    // TODO: Consider checking the content of the response to ensure that the service is fully initialized
                    // and ready to accept commands, rather than just checking for a successful status code.
                    if (response.IsSuccessStatusCode)
                    {
                        if (_logger.IsEnabled(LogEventLevel.Debug))
                        {
                            _logger.Debug($"Driver service initialized successfully and ready to accept commands at {this.ServiceUrl}");
                        }
                        return;
                    }
                }
                catch (HttpRequestException)
                {
                    // The exception is expected, meaning driver service is not yet initialized.
                }

                // Avoid busy-waiting by introducing a small delay between polling attempts.
                await Task.Delay(50, linkedCts.Token).ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested)
        {
            throw new WebDriverException($"Timed out waiting for driver service to initialize after {this.InitializationTimeout.TotalSeconds} seconds. Service URL: {this.ServiceUrl}");
        }
    }
}
