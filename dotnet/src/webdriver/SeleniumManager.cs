// <copyright file="SeleniumManager.cs" company="WebDriver Committers">
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

using Newtonsoft.Json;
using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Wrapper for the Selenium Manager binary.
    /// This implementation is still in beta, and may change.
    /// </summary>
    public static class SeleniumManager
    {
        private readonly static string binaryFullPath;

        static SeleniumManager()
        {
            var currentDirectory = AppContext.BaseDirectory;

            string binary;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                binary = "selenium-manager/windows/selenium-manager.exe";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                binary = "selenium-manager/linux/selenium-manager";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                binary = "selenium-manager/macos/selenium-manager";
            }
            else
            {
                throw new WebDriverException("Selenium Manager did not find supported operating system");
            }

            binaryFullPath = Path.Combine(currentDirectory, binary);

            if (!File.Exists(binaryFullPath))
            {
                throw new WebDriverException($"Unable to locate or obtain Selenium Manager binary at {binaryFullPath}");
            }
        }

        /// <summary>
        /// Determines the location of the correct driver.
        /// </summary>
        /// <param name="options">The correct path depends on which options are being used.</param>
        /// <returns>
        /// The location of the driver.
        /// </returns>
        public static string DriverPath(DriverOptions options)
        {
            StringBuilder argsBuilder = new StringBuilder();
            argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser \"{0}\"", options.BrowserName);
            argsBuilder.Append(" --output json");

            if (!string.IsNullOrEmpty(options.BrowserVersion))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-version {0}", options.BrowserVersion);
            }

            string browserBinary = options.BinaryLocation;
            if (!string.IsNullOrEmpty(browserBinary))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-path \"{0}\"", browserBinary);
            }

            if (options.Proxy != null)
            {
                if (options.Proxy.SslProxy != null)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.SslProxy);
                }
                else if (options.Proxy.HttpProxy != null)
                {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.HttpProxy);
                }
            }

            Dictionary<string, object> output = RunCommand(binaryFullPath, argsBuilder.ToString());
            string browserPath = (string)output["browser_path"];
            string driverPath = (string)output["driver_path"];

            try
            {
                options.BinaryLocation = browserPath;
                options.BrowserVersion = null;
            }
            catch (NotImplementedException)
            {
                // Cannot set Browser Location for this driver and that is ok
            }

            return driverPath;
        }

        /// <summary>
        /// Executes a process with the given arguments.
        /// </summary>
        /// <param name="fileName">The path to the Selenium Manager.</param>
        /// <param name="arguments">The switches to be used by Selenium Manager.</param>
        /// <returns>
        /// the standard output of the execution.
        /// </returns>
        private static Dictionary<string, object> RunCommand(string fileName, string arguments)
        {
            Process process = new Process();
            process.StartInfo.FileName = binaryFullPath;
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
                    // We do not log any warnings coming from Selenium Manager like the other bindings as we don't have any logging in the .NET bindings

                    var exceptionMessageBuilder = new StringBuilder($"Selenium Manager process exited abnormally with {process.ExitCode} code: {fileName} {arguments}");

                    if (!string.IsNullOrEmpty(errorOutputBuilder.ToString()))
                    {
                        exceptionMessageBuilder.AppendLine();
                        exceptionMessageBuilder.Append("Error Output >>");
                        exceptionMessageBuilder.AppendLine();
                        exceptionMessageBuilder.Append(errorOutputBuilder);
                    }

                    if (!string.IsNullOrEmpty(outputBuilder.ToString()))
                    {
                        exceptionMessageBuilder.AppendLine();
                        exceptionMessageBuilder.Append("Standard Output >>");
                        exceptionMessageBuilder.AppendLine();
                        exceptionMessageBuilder.Append(outputBuilder);
                    }

                    throw new WebDriverException(exceptionMessageBuilder.ToString());
                }
            }
            catch (Exception ex)
            {
                throw new WebDriverException($"Error starting process: {fileName} {arguments}", ex);
            }
            finally
            {
                process.OutputDataReceived -= outputHandler;
                process.ErrorDataReceived -= errorOutputHandler;
            }

            string output = outputBuilder.ToString().Trim();
            Dictionary<string, object> result;
            try
            {
                Dictionary<string, object> deserializedOutput = JsonConvert.DeserializeObject<Dictionary<string, object>>(output, new ResponseValueJsonConverter());
                result = deserializedOutput["result"] as Dictionary<string, object>;
            }
            catch (Exception ex)
            {
                throw new WebDriverException($"Error deserializing Selenium Manager's response: {output}", ex);
            }

            return result;
        }
    }
}
