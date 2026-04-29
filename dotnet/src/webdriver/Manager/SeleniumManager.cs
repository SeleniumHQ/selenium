// <copyright file="SeleniumManager.cs" company="Selenium Committers">
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
using System.Globalization;
#if !NET8_0_OR_GREATER
using System.Runtime.InteropServices;
#endif
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.Manager;

/// <summary>
/// Manages automatic discovery and configuration of browser drivers.
/// </summary>
/// <remarks>
/// <para>
/// <b>Warning: This is an experimental API that is subject to change in future versions.</b>
/// </para>
/// Selenium Manager automatically locates or downloads the appropriate browser driver
/// for the specified browser. It eliminates the need for manual driver management by:
/// <list type="bullet">
/// <item><description>Detecting the installed browser version</description></item>
/// <item><description>Downloading the matching driver binary if needed</description></item>
/// <item><description>Caching drivers for subsequent use</description></item>
/// <item><description>Providing paths to both driver and browser executables</description></item>
/// </list>
/// <para>
/// The Selenium Manager binary is automatically included with the Selenium package.
/// Set the SE_MANAGER_PATH environment variable to use a custom binary location.
/// </para>
/// </remarks>
public static partial class SeleniumManager
{
    private static readonly ILogger _logger = Log.GetLogger(typeof(SeleniumManager));

    // This logic to find the Selenium Manager binary is complex due to supporting multiple deployment scenarios.
    // Once Selenium Manager becomes a true native library (dll, so, dylib),
    // we will be able to reference it directly from the .NET bindings, and this logic will be removed.
    private static readonly Lazy<string> _lazyBinaryFullPath = new(() =>
    {
        if (_logger.IsEnabled(LogEventLevel.Debug))
        {
            _logger.Debug("Locating Selenium Manager executable binary...");
        }

        string? binaryFullPath = Environment.GetEnvironmentVariable("SE_MANAGER_PATH");

        if (binaryFullPath is not null)
        {
            if (!File.Exists(binaryFullPath))
            {
                throw new FileNotFoundException($"Unable to locate provided Selenium Manager binary at '{binaryFullPath}'.");
            }

            return binaryFullPath;
        }

#if NET8_0_OR_GREATER
        SupportedPlatform? platform = null;

        if (OperatingSystem.IsWindows())
        {
            platform = SupportedPlatform.Windows;
        }
        else if (OperatingSystem.IsLinux() || OperatingSystem.IsFreeBSD())
        {
            platform = SupportedPlatform.Linux;
        }
        else if (OperatingSystem.IsMacOS() || OperatingSystem.IsMacCatalyst())
        {
            platform = SupportedPlatform.MacOS;
        }
#elif NETSTANDARD2_0
        SupportedPlatform? platform = null;

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            platform = SupportedPlatform.Windows;
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            platform = SupportedPlatform.Linux;
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            platform = SupportedPlatform.MacOS;
        }
#elif NET462
        var platform = SupportedPlatform.Windows;
#endif

        var seleniumManagerFileName = platform switch
        {
            SupportedPlatform.Windows => "selenium-manager.exe",
            SupportedPlatform.Linux => "selenium-manager",
            SupportedPlatform.MacOS => "selenium-manager",
            _ => throw new PlatformNotSupportedException(
                $"Selenium Manager doesn't support your runtime platform: {Environment.OSVersion.Platform}"),
        };

        var baseDirectory = AppContext.BaseDirectory;

        List<string> probingPaths = [];

        if (baseDirectory is not null)
        {
            probingPaths.Add(Path.Combine(baseDirectory, seleniumManagerFileName));

            switch (platform)
            {
                case SupportedPlatform.Windows:
                    probingPaths.Add(Path.Combine(baseDirectory, "runtimes", "win", "native", seleniumManagerFileName));
                    break;
                case SupportedPlatform.Linux:
                    probingPaths.Add(Path.Combine(baseDirectory, "runtimes", "linux", "native", seleniumManagerFileName));
                    break;
                case SupportedPlatform.MacOS:
                    probingPaths.Add(Path.Combine(baseDirectory, "runtimes", "osx", "native", seleniumManagerFileName));
                    break;
            }
        }

#if !NET462
        // Supporting .NET5+ applications deployed as bundled applications (single file or AOT).
        // In this case bootstrapper extracts the native libraries into a temporary directory.
        // Most interesting build properties: "IncludeNativeLibrariesForSelfExtract" and "IncludeAllContentForSelfExtract".
        var nativeDllSearchDirectories = AppContext.GetData("NATIVE_DLL_SEARCH_DIRECTORIES")?.ToString();

        if (nativeDllSearchDirectories is not null)
        {
            probingPaths.AddRange(nativeDllSearchDirectories.Split(new char[] { Path.PathSeparator }, StringSplitOptions.RemoveEmptyEntries).Select(path => Path.Combine(path, seleniumManagerFileName)));
        }
#endif

        // Covering the case when the application is hosted by another application, most likely
        // we can find Selenium Manager in the assembly location, because "AppContext.BaseDirectory"
        // might return the path of the host application.
        var assemblyDirectory = Path.GetDirectoryName(typeof(SeleniumManager).Assembly.Location);

        if (assemblyDirectory is not null)
        {
            probingPaths.Add(Path.Combine(assemblyDirectory, seleniumManagerFileName));
        }

        probingPaths = [.. probingPaths.Distinct()];

        binaryFullPath = probingPaths.FirstOrDefault(File.Exists);

        if (binaryFullPath is null)
        {
            var messageBuilder = new StringBuilder();
            messageBuilder.AppendFormat("Selenium Manager binary '{0}' was not found in the following paths:", seleniumManagerFileName);

            foreach (var probingPath in probingPaths)
            {
                messageBuilder.AppendLine();
                messageBuilder.AppendFormat("  - {0}", probingPath);
            }

            throw new FileNotFoundException(messageBuilder.ToString());
        }

        return binaryFullPath;
    });

    /// <summary>
    /// Discovers the browser and driver paths for the specified browser.
    /// </summary>
    /// <param name="name">The name of the browser (e.g., "chrome", "firefox", "edge").</param>
    /// <param name="options">Optional discovery options to control browser and driver resolution.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation. When cancellation is requested, the Selenium Manager process is terminated.</param>
    /// <returns>A <see cref="Task{TResult}"/> representing the asynchronous operation, containing a <see cref="BrowserDiscoveryResult"/> with the paths to the driver and browser executables.</returns>
    /// <exception cref="ArgumentException">Thrown when <paramref name="name"/> is null, empty, or whitespace.</exception>
    /// <exception cref="WebDriverException">Thrown when Selenium Manager fails to locate or download the required binaries.</exception>
    /// <exception cref="OperationCanceledException">Thrown when the operation is canceled via <paramref name="cancellationToken"/>.</exception>
    public static async Task<BrowserDiscoveryResult> DiscoverBrowserAsync(
        string name,
        BrowserDiscoveryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Browser name must be specified to find the driver using Selenium Manager.", nameof(name));
        }

        StringBuilder argsBuilder = new();

        argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser \"{0}\"", name);

        if (options is not null)
        {
            if (!string.IsNullOrEmpty(options.BrowserVersion))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-version \"{0}\"", options.BrowserVersion);
            }

            if (!string.IsNullOrEmpty(options.BrowserPath))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-path \"{0}\"", options.BrowserPath);
            }

            if (!string.IsNullOrEmpty(options.DriverVersion))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --driver-version \"{0}\"", options.DriverVersion);
            }

            if (!string.IsNullOrEmpty(options.Proxy))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy);
            }
        }

        argsBuilder.Append(" --language-binding csharp");
        argsBuilder.Append(" --output mixed");

        if (_logger.IsEnabled(LogEventLevel.Trace))
        {
            argsBuilder.Append(" --log-level trace");
        }
        else if (_logger.IsEnabled(LogEventLevel.Debug))
        {
            argsBuilder.Append(" --log-level debug");
        }

        return await RunCommandAsync(argsBuilder.ToString(), SeleniumManagerSerializerContext.Default.BrowserDiscoveryResult, cancellationToken).ConfigureAwait(false);
    }

    private static async Task<TResult> RunCommandAsync<TResult>(
        string arguments,
        JsonTypeInfo<TResult> jsonResultTypeInfo,
        CancellationToken cancellationToken = default)
    {
        string smBinaryPath = _lazyBinaryFullPath.Value;

        if (_logger.IsEnabled(LogEventLevel.Info))
        {
            _logger.Info($"Starting Selenium Manager process: {Path.GetFileName(smBinaryPath)} {arguments}");
        }

        using Process process = new();
        process.StartInfo.FileName = smBinaryPath;
        process.StartInfo.Arguments = arguments;
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.CreateNoWindow = true;
        process.StartInfo.StandardErrorEncoding = Encoding.UTF8;
        process.StartInfo.StandardOutputEncoding = Encoding.UTF8;
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;

        StringBuilder stdOutputBuilder = new();
        StringBuilder errOutputBuilder = new();

        try
        {
#if !NET8_0_OR_GREATER
            process.EnableRaisingEvents = true;
#endif

            process.Start();

            var stdOutputTask = ReadStandardOutputAsync();
            var errOutputTask = ReadErrorOutputAsync();

#if NET8_0_OR_GREATER
            try
            {
                await process.WaitForExitAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                try
                {
                    process.Kill();
                }
                catch
                {
                    // Process may have already exited
                }

                // Await output tasks to prevent unobserved exceptions when process is killed
                await AwaitAndSuppressExceptionsAsync(stdOutputTask, errOutputTask).ConfigureAwait(false);

                throw;
            }
#else
            var tcs = new TaskCompletionSource<bool>();

            EventHandler exitedHandler = (sender, args) => tcs.TrySetResult(true);
            process.Exited += exitedHandler;

            try
            {
                // Handle race condition where process exits before we subscribe
                if (process.HasExited)
                {
                    tcs.TrySetResult(true);
                }

                using (cancellationToken.Register(() =>
                {
                    tcs.TrySetCanceled(cancellationToken);
                    try
                    {
                        process.Kill();
                    }
                    catch
                    {
                        // Process may have already exited
                    }
                }))
                {
                    try
                    {
                        await tcs.Task.ConfigureAwait(false);
                    }
                    catch (OperationCanceledException)
                    {
                        try
                        {
                            process.Kill();
                        }
                        catch
                        {
                            // Process may have already exited
                        }

                        // Await output tasks to prevent unobserved exceptions when process is killed
                        await AwaitAndSuppressExceptionsAsync(stdOutputTask, errOutputTask).ConfigureAwait(false);

                        throw;
                    }
                }

                // Handle race condition where cancellation was requested after process exit
                // but before we checked the TaskCompletionSource result.
                cancellationToken.ThrowIfCancellationRequested();
            }
            finally
            {
                process.Exited -= exitedHandler;
            }
#endif

            // Ensure output streams are fully drained before parsing.
            // ReadLineAsync processes lines as they arrive and completes when stream ends.
            await Task.WhenAll(stdOutputTask, errOutputTask).ConfigureAwait(false);

            if (process.ExitCode != 0)
            {
                var exceptionMessageBuilder = new StringBuilder($"Selenium Manager process exited abnormally with {process.ExitCode} code: {process.StartInfo.FileName} {arguments}");

                if (!string.IsNullOrWhiteSpace(stdOutputBuilder.ToString()))
                {
                    exceptionMessageBuilder.AppendLine();
                    exceptionMessageBuilder.AppendLine("--- Standard Output ---");
                    exceptionMessageBuilder.Append(stdOutputBuilder);
                    exceptionMessageBuilder.AppendLine("--- End Standard Output ---");
                }

                if (!string.IsNullOrWhiteSpace(errOutputBuilder.ToString()))
                {
                    exceptionMessageBuilder.AppendLine();
                    exceptionMessageBuilder.AppendLine("--- Error Output ---");
                    exceptionMessageBuilder.Append(errOutputBuilder);
                    exceptionMessageBuilder.AppendLine("--- End Error Output ---");
                }

                throw new WebDriverException(exceptionMessageBuilder.ToString());
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not WebDriverException)
        {
            throw new WebDriverException($"Error running Selenium Manager process: {process.StartInfo.FileName} {arguments}", ex);
        }

        string output = stdOutputBuilder.ToString();

        TResult result;

        try
        {
            result = JsonSerializer.Deserialize(output, jsonResultTypeInfo)
                ?? throw new JsonException($"Selenium Manager returned empty json output: {output}");
        }
        catch (Exception ex)
        {
            throw new WebDriverException($"Error deserializing Selenium Manager's response: {output}", ex);
        }

        return result;

        // Local functions to read process output streams concurrently
        async Task ReadStandardOutputAsync()
        {
            string? line;

#if NET8_0_OR_GREATER
            while ((line = await process.StandardOutput.ReadLineAsync(cancellationToken).ConfigureAwait(false)) is not null)
#else
            while ((line = await process.StandardOutput.ReadLineAsync().ConfigureAwait(false)) is not null)
#endif
            {
                stdOutputBuilder.AppendLine(line);
            }
        }

        async Task ReadErrorOutputAsync()
        {
            string? line;

#if NET8_0_OR_GREATER
            while ((line = await process.StandardError.ReadLineAsync(cancellationToken).ConfigureAwait(false)) is not null)
#else
            while ((line = await process.StandardError.ReadLineAsync().ConfigureAwait(false)) is not null)
#endif
            {
                var match = LogMessageRegex.Match(line);

                if (match.Success)
                {
                    if (!DateTimeOffset.TryParse(match.Groups[1].Value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dateTime))
                    {
                        if (_logger.IsEnabled(LogEventLevel.Warn))
                        {
                            _logger.Warn($"Unable to parse log message timestamp from Selenium Manager: '{match.Groups[1].Value}'. Defaulting to current time.");
                        }

                        dateTime = DateTimeOffset.UtcNow;
                    }

                    var logLevel = match.Groups[2].Value;
                    var message = match.Groups[3].Value;

                    switch (logLevel)
                    {
                        case "INFO":
                            _logger.LogMessage(dateTime, LogEventLevel.Info, message);
                            break;
                        case "WARN":
                            _logger.LogMessage(dateTime, LogEventLevel.Warn, message);
                            break;
                        case "ERROR":
                            _logger.LogMessage(dateTime, LogEventLevel.Error, message);
                            break;
                        case "DEBUG":
                            _logger.LogMessage(dateTime, LogEventLevel.Debug, message);
                            break;
                        case "TRACE":
                            _logger.LogMessage(dateTime, LogEventLevel.Trace, message);
                            break;
                        default:
                            if (_logger.IsEnabled(LogEventLevel.Warn))
                            {
                                _logger.Warn($"Unknown log level '{logLevel}' in Selenium Manager log message. Original message: {line}");
                            }
                            _logger.LogMessage(dateTime, LogEventLevel.Trace, message);
                            break;
                    }
                }
                else
                {
                    // Collect non-structured error output for exception reporting
                    errOutputBuilder.AppendLine(line);
                }
            }
        }

        static async Task AwaitAndSuppressExceptionsAsync(params Task[] tasks)
        {
            try
            {
                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            catch
            {
                // Suppress exceptions
            }
        }
    }

    // Regex pattern to parse structured log messages from Selenium Manager.
    // Example: "[2026-02-10T19:33:13.886Z ERROR] You need to specify a browser or driver"
    // Groups: (1) timestamp, (2) log level, (3) message
    // The optional tab (\t?) handles formatting variations between log levels.
    const string LogMessageRegexPattern = @"^\[(.*) ([A-Z]+)\t?\] (.*)$";

#if NET8_0_OR_GREATER
    [GeneratedRegex(LogMessageRegexPattern)]
    private static partial Regex GeneratedLogMessageRegex();

    private static Regex LogMessageRegex { get; } = GeneratedLogMessageRegex();
#else
    private static Regex LogMessageRegex { get; } = new(LogMessageRegexPattern, RegexOptions.Compiled);
#endif
}

/// <summary>
/// Provides optional configuration for browser and driver discovery.
/// </summary>
public record BrowserDiscoveryOptions
{
    /// <summary>
    /// Gets or sets the specific browser version to target (e.g., "120.0.6099.109").
    /// If not specified, the installed browser version is detected automatically.
    /// </summary>
    public string? BrowserVersion { get; set; }

    /// <summary>
    /// Gets or sets the path to the browser executable.
    /// When specified, Selenium Manager uses this path instead of detecting the browser location.
    /// </summary>
    public string? BrowserPath { get; set; }

    /// <summary>
    /// Gets or sets the specific driver version to download (e.g., "120.0.6099.109").
    /// If not specified, the driver version matching the browser version is selected automatically.
    /// </summary>
    public string? DriverVersion { get; set; }

    /// <summary>
    /// Gets or sets the proxy server URL for downloading browser drivers.
    /// </summary>
    public string? Proxy { get; set; }
}

/// <summary>
/// Contains the paths to the discovered browser driver and browser executable.
/// </summary>
/// <param name="DriverPath">The absolute path to the browser driver executable.</param>
/// <param name="BrowserPath">The absolute path to the browser executable.</param>
public record BrowserDiscoveryResult(
    [property: JsonPropertyName("driver_path")] string DriverPath,
    [property: JsonPropertyName("browser_path")] string BrowserPath);

[JsonSerializable(typeof(BrowserDiscoveryResult))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal sealed partial class SeleniumManagerSerializerContext : JsonSerializerContext;

internal enum SupportedPlatform
{
    Windows,
    Linux,
    MacOS
}
