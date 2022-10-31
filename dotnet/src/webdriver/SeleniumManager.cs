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
        private static readonly List<string> KnownDrivers = new List<string>() {
            "geckodriver.exe",
            "chromedriver.exe",
            "msedgedriver.exe"
        };

        /// <summary>
        /// Determines the location of the correct driver.
        /// </summary>
        /// <param name="driverName">Which driver the service needs.</param>
        /// <returns>
        /// The location of the driver.
        /// </returns>
        public static string DriverPath(string driverName)
        {
            if (!KnownDrivers.Contains(driverName))
            {
                throw new WebDriverException("Unable to locate driver with name: " + driverName);
            }
            var binaryFile = Binary;
            if (binaryFile == null) return null;

            var arguments = "--driver " + driverName.Replace(".exe", "");
            var output = RunCommand(binaryFile, arguments);
            return output.Replace("INFO\t", "").TrimEnd();
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
                    string folder = "windows";
                    string extension = ".exe";

                    if (!Environment.OSVersion.Platform.ToString().StartsWith("Win"))
                    {
                        throw new WebDriverException("Selenium Manager only supports Windows in .NET at this time");
                    }

                    try
                    {
                        string name = "selenium-manager-" + folder;
                        using (Stream fileStream = ResourceUtilities.GetResourceStream(name, name))
                        {
                            using (BinaryReader binReader = new BinaryReader(fileStream, Encoding.ASCII))
                            {
                                byte[] fileBytes = binReader.ReadBytes((int)fileStream.Length);
                                string directoryName = string.Format(CultureInfo.InvariantCulture, "webdriver.{0}",
                                    Guid.NewGuid().ToString("N"));
                                var path = Path.Combine(Path.GetTempPath(), directoryName + "/" + folder);
                                Directory.CreateDirectory(path);
                                var filePath = Path.Combine(path, "selenium-manager" + extension);

                                using (BinaryWriter binWriter = new BinaryWriter(File.Open(filePath, FileMode.Create)))
                                {
                                    binWriter.Flush();
                                    binWriter.Write(fileBytes);
                                }
                                binary = filePath;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        throw new WebDriverException("Unable to obtain Selenium Manager", ex);
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

            try
            {
                process.Start();
            }
            catch (Exception ex)
            {
                throw new WebDriverException("Error starting process: " + process, ex);
            }

            String output = process.StandardOutput.ReadToEnd();

            if (!output.StartsWith("INFO")) {
                throw new WebDriverException("Invalid response from process: " + process);
            }

            return output;
        }
    }
}
