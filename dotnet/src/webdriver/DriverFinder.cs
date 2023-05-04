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
        /// Checks if the driver path exists, else uses Selenium Manager to return it.
        /// </summary>
        /// <param name="service">DriverService with the current path.</param>
        /// <param name="options">DriverOptions with the current browser options.</param>
        /// <returns>
        /// The service with a verified driver executable path.
        /// </returns>
        public static DriverService VerifyDriverServicePath(DriverService service, DriverOptions options)
        {
            string executablePath = Path.Combine(service.DriverServicePath, service.DriverServiceExecutableName);
            if (File.Exists(executablePath)) return service;
            try
            {
                string driverFullPath = SeleniumManager.DriverPath(options);
                service.DriverServicePath = Path.GetDirectoryName(driverFullPath);
                service.DriverServiceExecutableName = Path.GetFileName(driverFullPath);
                return service;
            }
            catch (Exception e)
            {
                throw new WebDriverException($"Unable to locate driver with path: {executablePath}, for more information on how to install drivers see https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/", e);
            }
        }
    }
}
