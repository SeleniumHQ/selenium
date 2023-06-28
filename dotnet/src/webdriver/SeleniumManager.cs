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
using System.Reflection;

#if !NET45 && !NET46 && !NET47
using System.Runtime.InteropServices;
#endif

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
#if NET45
            var currentDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
#else
            var currentDirectory = AppContext.BaseDirectory;
#endif

            string binary;
#if NET45 || NET46 || NET47
                binary = "selenium-manager/windows/selenium-manager.exe";
#else
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
#endif

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

            string browserBinary = BrowserBinary(options);
            if (!string.IsNullOrEmpty(browserBinary))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --browser-path \"{0}\"", browserBinary);
            }

            if (options.Proxy != null)
            {
                if (options.Proxy.SslProxy != null) {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.SslProxy);
                } else if (options.Proxy.HttpProxy != null) {
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --proxy \"{0}\"", options.Proxy.HttpProxy);
                }
            }

            return RunCommand(binaryFullPath, argsBuilder.ToString());
        }


        /// <summary>
        /// Extracts the browser binary location from the vendor options when present. Only Chrome, Firefox, and Edge.
        /// </summary>
        private static string BrowserBinary(DriverOptions options)
        {
            ICapabilities capabilities = options.ToCapabilities();
            string[] vendorOptionsCapabilities = { "moz:firefoxOptions", "goog:chromeOptions", "ms:edgeOptions" };
            foreach (string vendorOptionsCapability in vendorOptionsCapabilities)
            {
                IDictionary<string, object> vendorOptions = capabilities.GetCapability(vendorOptionsCapability) as IDictionary<string, object>;

                if (vendorOptions != null && vendorOptions.TryGetValue("binary", out object browserBinaryPath))
                {
                    return browserBinaryPath as string;
                }
            }

            return null;
        }


        /// <summary>
        /// Executes a process with the given arguments.
        /// </summary>
        /// <param name="fileName">The path to the Selenium Manager.</param>
        /// <param name="arguments">The switches to be used by Selenium Manager.</param>
        /// <returns>
        /// the standard output of the execution.
        /// </returns>
        private static string RunCommand(string fileName, string arguments)
        {
            Process process = new Process();
            process.StartInfo.FileName = binaryFullPath;
            process.StartInfo.Arguments = arguments;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.StandardErrorEncoding = Encoding.UTF8;
            process.StartInfo.StandardOutputEncoding = Encoding.UTF8;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;

            StringBuilder outputBuilder = new StringBuilder();

            DataReceivedEventHandler outputHandler = (sender, e) => outputBuilder.AppendLine(e.Data);

            try
            {
                process.OutputDataReceived += outputHandler;

                process.Start();

                process.BeginOutputReadLine();

                process.WaitForExit();

                if (process.ExitCode != 0)
                {
                    // We do not log any warnings coming from Selenium Manager like the other bindings as we don't have any logging in the .NET bindings

                    throw new WebDriverException($"Selenium Manager process exited abnormally with {process.ExitCode} code: {fileName} {arguments}\n{outputBuilder}");
                }
            }
            catch (Exception ex)
            {
                throw new WebDriverException($"Error starting process: {fileName} {arguments}", ex);
            }
            finally
            {
                process.OutputDataReceived -= outputHandler;
            }

            string output = outputBuilder.ToString().Trim();
            string result;
            try
            {
                Dictionary<string, object> deserializedOutput = JsonConvert.DeserializeObject<Dictionary<string, object>>(output, new ResponseValueJsonConverter());
                Dictionary<string, object> deserializedResult = deserializedOutput["result"] as Dictionary<string, object>;
                result = deserializedResult["message"] as string;
            }
            catch (Exception ex)
            {
                throw new WebDriverException($"Error deserializing Selenium Manager's response: {output}", ex);
            }

            return result;
        }
    }
}
