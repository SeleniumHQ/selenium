// <copyright file="ChromeDriver.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2007 ThoughtWorks, Inc
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
            : this(ChromeDriverService.CreateDefaultService(), DesiredCapabilities.Chrome(), TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        public ChromeDriver(string chromeDriverDirectory)
            : this(chromeDriverDirectory, DesiredCapabilities.Chrome())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the capabilities.
        /// </summary>
        /// <param name="capabilities">The desired capabilities of the Chrome driver.</param>
        public ChromeDriver(ICapabilities capabilities)
            : this(ChromeDriverService.CreateDefaultService(), capabilities, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe and capabilities.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        /// <param name="capabilities">The desired capabilities of the Chrome driver.</param>
        public ChromeDriver(string chromeDriverDirectory, ICapabilities capabilities)
            : this(ChromeDriverService.CreateDefaultService(chromeDriverDirectory), capabilities, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified path to the directory containing ChromeDriver.exe, command timeout, and capabilities.
        /// </summary>
        /// <param name="chromeDriverDirectory">The full path to the directory containing ChromeDriver.exe.</param>
        /// <param name="capabilities">The desired capabilities of the Chrome driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public ChromeDriver(string chromeDriverDirectory, ICapabilities capabilities, TimeSpan commandTimeout)
            : this(ChromeDriverService.CreateDefaultService(chromeDriverDirectory), capabilities, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified <see cref="ChromeDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="ChromeDriverService"/> to use.</param>
        /// <param name="capabilities">The desired capabilities of the Chrome driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        private ChromeDriver(ChromeDriverService service, ICapabilities capabilities, TimeSpan commandTimeout)
            : base(new ChromeCommandExecutor(service, commandTimeout), capabilities)
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

        #region Protected Methods
        /// <summary>
        /// By default will try to load Chrome from system property
        /// webdriver.chrome.bin and the extension from
        /// webdriver.chrome.extensiondir.  If the former fails, will try to guess the
        /// path to Chrome.  If the latter fails, will try to unzip from the JAR we 
        /// hope we're in.  If these fail, throws exceptions.
        /// </summary>
        protected override void StartClient()
        {
            ((ChromeCommandExecutor)CommandExecutor).Start();
        }

        /// <summary>
        /// Kills the started Chrome process and ChromeCommandExecutor if they exist
        /// </summary>
        protected override void StopClient()
        {
            ((ChromeCommandExecutor)CommandExecutor).Stop();
        }
        #endregion
    }
}
