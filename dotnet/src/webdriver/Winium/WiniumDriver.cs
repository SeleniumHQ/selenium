// <copyright file="WiniumDriver.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Winium
{
    /// <summary>
    ///  Provides a mechanism to write tests using Winium driver.
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
    ///         var options = new DesktopOptions { ApplicationPath = @"‪C:\Windows\System32\notepad.exe" };
    ///         driver = new WiniumDriver(options);
    ///     }
    ///     <para></para>
    ///     [Test]
    ///     public void TestGoogle()
    ///     {
    ///        /*
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
    public class WiniumDriver : RemoteWebDriver
    {
        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="WiniumDriver"/> class using the specified path
        /// to the directory containing Winium.Driver executible file and options.
        /// </summary>
        /// <param name="winiumDriverDirectory">
        /// The full path to the directory containing Winium.Driver executible.
        /// </param>
        /// <param name="options">
        /// The <see cref="DesktopOptions"/> to be used with the Winium driver.
        /// </param>
        public WiniumDriver(string winiumDriverDirectory, IWiniumOptions options)
            : this(winiumDriverDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WiniumDriver"/> class using the specified path
        /// to the directory containing Winium.Driver executible file, options, and command timeout.
        /// </summary>
        /// <param name="winiumDriverDirectory">
        /// The full path to the directory containing Winium.Driver executible file.
        /// </param>
        /// <param name="options">
        /// The <see cref="DesktopOptions"/> to be used with the Winium driver.
        /// </param>
        /// <param name="commandTimeout">
        /// The maximum amount of time to wait for each command.
        /// </param>
        public WiniumDriver(string winiumDriverDirectory, IWiniumOptions options, TimeSpan commandTimeout)
            : this(CreateDefaultService(options.GetType(), winiumDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WiniumDriver"/> class using the specified 
        /// <see cref="WiniumDriverService"/> and options.
        /// </summary>
        /// <param name="service">The <see cref="WiniumDriverService"/> to use.</param>
        /// <param name="options">The <see cref="DesktopOptions"/> used to initialize the driver.</param>
        public WiniumDriver(WiniumDriverService service, IWiniumOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WiniumDriver"/> class using the specified <see cref="WiniumDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="WiniumDriverService"/> to use.</param>
        /// <param name="options">The <see cref="IWiniumOptions"/> object to be used with the Winium driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public WiniumDriver(WiniumDriverService service, IWiniumOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), options.ToCapabilities())
        {
        }
        #endregion

        private static WiniumDriverService CreateDefaultService(Type optionsType, string directory)
        {
            if (optionsType == typeof(DesktopOptions))
            {
                return WiniumDriverService.CreateDesktopService(directory);
            }

            if (optionsType == typeof(StoreAppsOptions))
            {
                return WiniumDriverService.CreateStoreAppsService(directory);
            }

            if (optionsType == typeof(SilverlightOptions))
            {
                return WiniumDriverService.CreateSilverlightService(directory);
            }

            throw new ArgumentException("Option type must be type of DesktopOptions, StoreAppsOptions or SilverlightOptions", "optionsType");
        }
    }
}
