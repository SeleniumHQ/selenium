// <copyright file="ChromeDriver.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to write tests against Chrome
    /// </summary>
    /// <example>
    /// <code>
    /// [TestFixture]
    /// public class Testing
    /// {
    ///     private IWebDriver driver;
    ///     <para></para>
    ///     [SetUp]
    ///     public void SetUp()
    ///     {
    ///         driver = new ChromeDriver();
    ///     }
    ///     <para></para>
    ///     [Test]
    ///     public void TestGoogle()
    ///     {
    ///         driver.Navigate().GoToUrl("http://www.google.co.uk");
    ///         /*
    ///         *   Rest of the test
    ///         */
    ///     }
    ///     <para></para>
    ///     [TearDown]
    ///     public void TearDown()
    ///     {
    ///         driver.Quit();
    ///     } 
    /// }
    /// </code>
    /// </example>
    public class ChromeDriver : RemoteWebDriver, ITakesScreenshot
    {
        /// <summary>
        /// Accept untrusted SSL Certificates
        /// </summary>
        public static readonly bool AcceptUntrustedCertificates = true;

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the ChromeDriver class.
        /// </summary>
        public ChromeDriver()
            : this(new ChromeOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        public ChromeDriver(string chromeDriverDirectory)
            : this(chromeDriverDirectory, new ChromeOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified options.
        /// </summary>
        /// <param name="options">The <see cref="ChromeOptions"/> to be used with the Chrome driver.</param>
        public ChromeDriver(ChromeOptions options)
            : this(ChromeDriverService.CreateDefaultService(), options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe and options.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        /// <param name="options">The <see cref="ChromeOptions"/> to be used with the Chrome driver.</param>
        public ChromeDriver(string chromeDriverDirectory, ChromeOptions options)
            : this(chromeDriverDirectory, options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe, command timeout, and options.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        /// <param name="options">The <see cref="ChromeOptions"/> to be used with the Chrome driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public ChromeDriver(string chromeDriverDirectory, ChromeOptions options, TimeSpan commandTimeout)
            : this(ChromeDriverService.CreateDefaultService(chromeDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified <see cref="ChromeDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="ChromeDriverService"/> to use.</param>
        /// <param name="options">The <see cref="ChromeOptions"/> to be used with the Chrome driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public ChromeDriver(DriverService service, ChromeOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), options.ToCapabilities())
        {
        }
        #endregion

        #region ITakesScreenshot Members
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            // Get the screenshot as base64.
            Response screenshotResponse = this.Execute(DriverCommand.Screenshot, null);
            string base64 = screenshotResponse.Value.ToString();

            // ... and convert it.
            return new Screenshot(base64);
        }
        #endregion
    }
}
