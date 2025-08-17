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

using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using static OpenQA.Selenium.SeleniumManagerResponse;

namespace OpenQA.Selenium;

/// <summary>
/// Wrapper for the Selenium Manager binary.
/// This implementation is still in beta, and may change.
/// </summary>
public static class SeleniumManager
{
    internal const string DriverPathKey = "driver_path";
    internal const string BrowserPathKey = "browser_path";

    private static readonly ILogger _logger = Log.GetLogger(typeof(SeleniumManager));

    // This logic to find Selenium Manager binary is complex and strange.
    // As soon as Selenium Manager will be real native library (dll ,so, dynlib),
    // we will be able to use it directly from the .NET bindings, and this logic will be removed.
    private static readonly Lazy<string> _lazyBinaryFullPath = new(() =>
    {
        string? binaryFullPath = Environment.GetEnvironmentVariable("SE_MANAGER_PATH");

        if (binaryFullPath is not null)
        {
            if (!File.Exists(binaryFullPath))
            {
                throw new FileNotFoundException($"Unable to locate provided Selenium Manager binary at '{binaryFullPath}'.");
            }

            return binaryFullPath;
        }

        SupportedPlatform? platform = null;

#if NET8_0_OR_GREATER
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
#else
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
#endif

        var seleniumManagerFileName = platform switch
        {
            SupportedPlatform.Windows => "selenium-manager.exe",
            SupportedPlatform.Linux => "selenium-manager",
            SupportedPlatform.MacOS => "selenium-manager",
            _ => throw new PlatformNotSupportedException(
                $"Selenium Manager doesn't support your runtime platform: {RuntimeInformation.OSDescription}"),
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

        // Supporting .NET5+ applications deployed as bundled applications (single file or AOT).
        // In this case bootstrapper extracts the native libraries into a temporary directory.
        // Most interesting build properties: "IncludeNativeLibrariesForSelfExtract" and "IncludeAllContentForSelfExtract".
        var nativeDllSearchDirectories = AppContext.GetData("NATIVE_DLL_SEARCH_DIRECTORIES")?.ToString();

        if (nativeDllSearchDirectories is not null)
        {
            probingPaths.AddRange(nativeDllSearchDirectories.Split(new char[] { Path.PathSeparator }, StringSplitOptions.RemoveEmptyEntries).Select(path => Path.Combine(path, seleniumManagerFileName)));
        }

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
    /// Determines the location of the browser and driver binaries.
    /// </summary>
    /// <param name="arguments">List of arguments to use when invoking Selenium Manager.</param>
    /// <returns>
    /// An array with two entries, one for the driver path, and another one for the browser path.
    /// </returns>
    public static Dictionary<string, string> BinaryPaths(string arguments)
    {
        StringBuilder argsBuilder = new StringBuilder(arguments);
        argsBuilder.Append(" --language-binding csharp");
        argsBuilder.Append(" --output json");
        if (_logger.IsEnabled(LogEventLevel.Debug))
        {
            argsBuilder.Append(" --debug");
        }

        var smCommandResult = RunCommand(argsBuilder.ToString());
        Dictionary<string, string> binaryPaths = new()
        {
            { BrowserPathKey, smCommandResult.BrowserPath },
            { DriverPathKey, smCommandResult.DriverPath }
        };

        if (_logger.IsEnabled(LogEventLevel.Trace))
        {
            _logger.Trace($"Driver path: {binaryPaths[DriverPathKey]}");
            _logger.Trace($"Browser path: {binaryPaths[BrowserPathKey]}");
        }

        return binaryPaths;
    }

    /// <summary>
    /// Executes a process with the given arguments.
    /// </summary>
    /// <param name="arguments">The switches to be used by Selenium Manager.</param>
    /// <returns>
    /// the standard output of the execution.
    /// </returns>
    private static ResultResponse RunCommand(string arguments)
    {
        Process process = new Process();
        process.StartInfo.FileName = _lazyBinaryFullPath.Value;
        process.StartInfo.Arguments = arguments;
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.CreateNoWindow = true;
        process.StartInfo.StandardErrorEncoding = Encoding.UTF8;
        process.StartInfo.StandardOutputEncoding = Encoding.UTF8;
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;

        StringBuilder outputBuilder = new StringBuilder();
        StringBuilder errorOutputBuilder = new StringBuilder();

        DataReceivedEventHandler outputHandler = (sender, e) => outputBuilder.AppendLine(e.Data);
        DataReceivedEventHandler errorOutputHandler = (sender, e) => errorOutputBuilder.AppendLine(e.Data);

        try
        {
            process.OutputDataReceived += outputHandler;
            process.ErrorDataReceived += errorOutputHandler;

            process.Start();

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                // We do not log any warnings coming from Selenium Manager like the other bindings, as we don't have any logging in the .NET bindings

                var exceptionMessageBuilder = new StringBuilder($"Selenium Manager process exited abnormally with {process.ExitCode} code: {process.StartInfo.FileName} {arguments}");

                if (!string.IsNullOrWhiteSpace(errorOutputBuilder.ToString()))
                {
                    exceptionMessageBuilder.AppendLine();
                    exceptionMessageBuilder.AppendLine("Error Output >>");
                    exceptionMessageBuilder.Append(errorOutputBuilder);
                    exceptionMessageBuilder.AppendLine("<<");
                }

                if (!string.IsNullOrWhiteSpace(outputBuilder.ToString()))
                {
                    exceptionMessageBuilder.AppendLine();
                    exceptionMessageBuilder.AppendLine("Standard Output >>");
                    exceptionMessageBuilder.Append(outputBuilder);
                    exceptionMessageBuilder.AppendLine("<<");
                }

                throw new WebDriverException(exceptionMessageBuilder.ToString());
            }
        }
        catch (Exception ex)
        {
            throw new WebDriverException($"Error starting process: {process.StartInfo.FileName} {arguments}", ex);
        }
        finally
        {
            process.OutputDataReceived -= outputHandler;
            process.ErrorDataReceived -= errorOutputHandler;
        }

        string output = outputBuilder.ToString().Trim();

        SeleniumManagerResponse jsonResponse;

        try
        {
            jsonResponse = JsonSerializer.Deserialize(output, SeleniumManagerSerializerContext.Default.SeleniumManagerResponse)!;
        }
        catch (Exception ex)
        {
            throw new WebDriverException($"Error deserializing Selenium Manager's response: {output}", ex);
        }

        if (jsonResponse.Logs is not null)
        {
            // Treat SM's logs always as Trace to avoid SM writing at Info level
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                foreach (var entry in jsonResponse.Logs)
                {
                    _logger.Trace($"{entry.Level} {entry.Message}");
                }
            }
        }

        return jsonResponse.Result;
    }
}

internal sealed record SeleniumManagerResponse(IReadOnlyList<LogEntryResponse> Logs, ResultResponse Result)
{
    public sealed record LogEntryResponse(string Level, string Message);

    public sealed record ResultResponse
    (
        [property: JsonPropertyName(SeleniumManager.DriverPathKey)]
        string DriverPath,
        [property: JsonPropertyName(SeleniumManager.BrowserPathKey)]
        string BrowserPath
    );
}

[JsonSerializable(typeof(SeleniumManagerResponse))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal sealed partial class SeleniumManagerSerializerContext : JsonSerializerContext;

internal enum SupportedPlatform
{
    Windows,
    Linux,
    MacOS
}
