// <copyright file="EdgeDriver.cs" company="Microsoft">
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
using OpenQA.Selenium.Chromium;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Provides a mechanism to write tests against Edge
    /// </summary>
    public class EdgeDriver : ChromiumDriver
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class.
        /// </summary>
        public EdgeDriver()
            : this(new EdgeOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified Edge Chromium options.
        /// </summary>
        /// <param name="options">The <see cref="EdgeOptions"/> to be used with the Edge driver.</param>
        public EdgeDriver(EdgeOptions options)
            : this(EdgeDriverService.CreateDefaultService(), options)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified Edge Legacy options.
        /// </summary>
        /// <param name="options">The <see cref="EdgeOptions"/> to be used with the Edge driver.</param>
        public EdgeDriver(EdgeLegacyOptions options)
            : this(EdgeLegacyDriverService.CreateDefaultService(), options)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified Edge Chromium driver service.
        /// </summary>
        /// <param name="service">The <see cref="EdgeDriverService"/> used to initialize the driver.</param>
        public EdgeDriver(EdgeDriverService service)
            : this(service, new EdgeOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified Edge Legacy driver service.
        /// </summary>
        /// <param name="service">The <see cref="EdgeLegacyDriverService"/> used to initialize the driver.</param>
        public EdgeDriver(EdgeLegacyDriverService service)
            : this(service, new EdgeLegacyOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified path
        /// to the directory containing msedgedriver.exe for Edge Chromium.
        /// </summary>
        /// <param name="edgeDriverDirectory">The full path to the directory containing msedgedriver.exe.</param>
        public EdgeDriver(string edgeDriverDirectory)
            : this(edgeDriverDirectory, new EdgeOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified path
        /// to the directory containing msedgedriver.exe and options for Edge Chromium.
        /// </summary>
        /// <param name="edgeDriverDirectory">The full path to the directory containing EdgeDriver.exe.</param>
        /// <param name="options">The <see cref="EdgeOptions"/> to be used with the Edge driver.</param>
        public EdgeDriver(string edgeDriverDirectory, EdgeOptions options)
            : this(edgeDriverDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified path
        /// to the directory containing MicrosoftWebDriver.exe and options for Edge Legacy.
        /// </summary>
        /// <param name="edgeDriverDirectory">The full path to the directory containing EdgeDriver.exe.</param>
        /// <param name="options">The <see cref="EdgeLegacyOptions"/> to be used with the Edge driver.</param>
        public EdgeDriver(string edgeDriverDirectory, EdgeLegacyOptions options)
            : this(edgeDriverDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified path
        /// to the directory containing msedgedriver.exe, Edge Chromium options, and command timeout.
        /// </summary>
        /// <param name="edgeDriverDirectory">The full path to the directory containing msedgedriver.exe.</param>
        /// <param name="options">The <see cref="EdgeOptions"/> to be used with the Edge driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public EdgeDriver(string edgeDriverDirectory, EdgeOptions options, TimeSpan commandTimeout)
            : this(EdgeDriverService.CreateDefaultService(edgeDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified path
        /// to the directory containing MicrosoftWebDriver.exe, Edge Legacy options, and command timeout.
        /// </summary>
        /// <param name="edgeDriverDirectory">The full path to the directory containing MicrosoftWebDriver.exe.</param>
        /// <param name="options">The <see cref="EdgeLegacyOptions"/> to be used with the Edge driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public EdgeDriver(string edgeDriverDirectory, EdgeLegacyOptions options, TimeSpan commandTimeout)
            : this(EdgeLegacyDriverService.CreateDefaultService(edgeDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified
        /// <see cref="EdgeDriverService"/> and options for Edge Chromium.
        /// </summary>
        /// <param name="service">The <see cref="EdgeDriverService"/> to use.</param>
        /// <param name="options">The <see cref="EdgeOptions"/> used to initialize the driver.</param>
        public EdgeDriver(EdgeDriverService service, EdgeOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified
        /// <see cref="EdgeLegacyDriverService"/> and options for Edge Legacy.
        /// </summary>
        /// <param name="service">The <see cref="EdgeLegacyDriverService"/> to use.</param>
        /// <param name="options">The <see cref="EdgeLegacyOptions"/> used to initialize the driver.</param>
        public EdgeDriver(EdgeLegacyDriverService service, EdgeLegacyOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified <see cref="EdgeDriverService"/>
        /// for Edge Chromium.
        /// </summary>
        /// <param name="service">The <see cref="EdgeDriverService"/> to use.</param>
        /// <param name="options">The <see cref="EdgeOptions"/> to be used with the Edge driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public EdgeDriver(EdgeDriverService service, EdgeOptions options, TimeSpan commandTimeout)
            : base(service, options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeDriver"/> class using the specified <see cref="EdgeLegacyDriverService"/>
        /// for Edge Legacy.
        /// </summary>
        /// <param name="service">The <see cref="EdgeLegacyDriverService"/> to use.</param>
        /// <param name="options">The <see cref="EdgeLegacyOptions"/> to be used with the Edge driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public EdgeDriver(EdgeLegacyDriverService service, EdgeLegacyOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), options.ToCapabilities())
        {
        }
    }
}
