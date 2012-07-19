// <copyright file="InternetExplorerDriver.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a way to access Internet Explorer to run your tests by creating a InternetExplorerDriver instance
    /// </summary>
    /// <remarks>
    /// When the WebDriver object has been instantiated the browser will load. The test can then navigate to the URL under test and 
    /// start your test.
    /// </remarks>
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
    ///         driver = new InternetExplorerDriver();
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
    ///         driver.Dispose();
    ///     } 
    /// }
    /// </code>
    /// </example>
    public class InternetExplorerDriver : RemoteWebDriver, ITakesScreenshot
    {
        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class.
        /// </summary>
        public InternetExplorerDriver()
            : this(new InternetExplorerOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class with the desired options.
        /// </summary>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        public InternetExplorerDriver(InternetExplorerOptions options)
            : this(InternetExplorerDriverService.CreateDefaultService(), options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing IEDriverServer.exe.
        /// </summary>
        /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing IEDriverServer.exe.</param>
        public InternetExplorerDriver(string internetExplorerDriverServerDirectory)
            : this(internetExplorerDriverServerDirectory, new InternetExplorerOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing IEDriverServer.exe and command timeout.
        /// </summary>
        /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing IEDriverServer.exe.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        public InternetExplorerDriver(string internetExplorerDriverServerDirectory, InternetExplorerOptions options)
            : this(internetExplorerDriverServerDirectory, options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing IEDriverServer.exe and command timeout.
        /// </summary>
        /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing IEDriverServer.exe.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public InternetExplorerDriver(string internetExplorerDriverServerDirectory, InternetExplorerOptions options, TimeSpan commandTimeout)
            : this(InternetExplorerDriverService.CreateDefaultService(internetExplorerDriverServerDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified <see cref="DriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="DriverService"/> to use.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public InternetExplorerDriver(DriverService service, InternetExplorerOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), options.ToCapabilities())
        {
        }

        #region ITakesScreenshot Members
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            // Get the screenshot as base64.
            Response screenshotResponse = Execute(DriverCommand.Screenshot, null);
            string base64 = screenshotResponse.Value.ToString();

            // ... and convert it.
            return new Screenshot(base64);
        }
        #endregion
    }
}
