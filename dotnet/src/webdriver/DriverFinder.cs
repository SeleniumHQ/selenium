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
using System.IO;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Finds a driver, checks if the provided path exists, if not, Selenium Manager is used.
    /// This implementation is still in beta, and may change.
    /// </summary>
    public static class DriverFinder
    {
        /// <summary>
        /// Use Selenium Manager to locate the driver
        /// </summary>
        /// <param name="options">DriverOptions with the current browser options.</param>
        /// <returns>
        /// The full path and name of the driver
        /// </returns>
        /// <exception cref="NoSuchDriverException"></exception>
        public static string FullPath(DriverOptions options)
        {
            string executablePath;
            try
            {
                executablePath = SeleniumManager.DriverPath(options);
            }
            catch (Exception e)
            {
                throw new NoSuchDriverException($"Unable to obtain {options.BrowserName} using Selenium Manager", e);
            }

            string message;
            if (executablePath == null)
            {
                message = $"Unable to locate or obtain {options.BrowserName} driver";
            } else if (!File.Exists(executablePath))
            {
                message = $"{options.BrowserName} driver located at {executablePath}, but invalid";
            }
            else
            {
                return executablePath;
            }

            throw new NoSuchDriverException(message);
        }
    }
}
