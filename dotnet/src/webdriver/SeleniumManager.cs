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

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Wrapper for the Selenium Manager binary.
    /// </summary>
    public static class SeleniumManager
    {
        private static string binary;

        /// <summary>
        /// Determines the location of the correct driver.
        /// </summary>
        /// <param name="driverName">Which driver the service needs.</param>
        /// <returns>
        /// The location of the driver.
        /// </returns>
        public static string DriverPath(string driverName)
        {
            var binaryFile = Binary;
            if (binaryFile == null) return null;

            var arguments = "--driver " + driverName.Replace(".exe", "");
            var output = RunCommand(binaryFile, arguments);
            return output;
        }

        /// <summary>
        /// Gets the location of the correct Selenium Manager binary.
        /// </summary>
        private static string Binary
        {
            get
            {
                if (string.IsNullOrEmpty(binary))
                {
                    if (Environment.OSVersion.Platform.ToString().StartsWith("Win"))
                    {
                        binary = "selenium-manager/windows/selenium-manager.exe";
                    }
                    else if (Environment.OSVersion.Platform == PlatformID.Unix)
                    {
                        binary = "selenium-manager/linux/selenium-manager";
                    }
                    else if (Environment.OSVersion.Platform == PlatformID.MacOSX)
                    {
                        binary = "selenium-manager/macos/selenium-manager";
                    }
                }

                return binary;
            }
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
            process.StartInfo.FileName = fileName;
            process.StartInfo.Arguments = arguments;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;

            string output = "";
            string error = "";

            process.OutputDataReceived += new DataReceivedEventHandler((sender, e) =>
            { output += e.Data; });
            process.ErrorDataReceived += new DataReceivedEventHandler((sender, e) =>
            { error += e.Data; });

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                process.WaitForExit();
            }
            catch (Exception ex)
            {
                throw new WebDriverException($"Error starting process: {fileName}", ex);
            }

            var match = Regex.Match(output, "INFO\t(.*)");

            if (!match.Success) {
                throw new WebDriverException($"Unexpected output from Selenium Manager.{Environment.NewLine}Output: {output}{Environment.NewLine}Error:{error}");
            }

            return match.Groups[1].Value.Trim();
        }
    }
}
