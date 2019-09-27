// <copyright file="FirefoxDriver.cs" company="WebDriver Committers">
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
using System.IO;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides a way to access Firefox to run tests.
    /// </summary>
    /// <remarks>
    /// When the FirefoxDriver object has been instantiated the browser will load. The test can then navigate to the URL under test and
    /// start your test.
    /// <para>
    /// In the case of the FirefoxDriver, you can specify a named profile to be used, or you can let the
    /// driver create a temporary, anonymous profile. A custom extension allowing the driver to communicate
    /// to the browser will be installed into the profile.
    /// </para>
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
    ///         driver = new FirefoxDriver();
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
    public class FirefoxDriver : RemoteWebDriver
    {
        private const string SetContextCommand = "setContext";

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class.
        /// </summary>
        public FirefoxDriver()
            : this(new FirefoxOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified options. Uses the Mozilla-provided Marionette driver implementation.
        /// </summary>
        /// <param name="options">The <see cref="FirefoxOptions"/> to be used with the Firefox driver.</param>
        public FirefoxDriver(FirefoxOptions options)
            : this(CreateService(options), options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified driver service. Uses the Mozilla-provided Marionette driver implementation.
        /// </summary>
        /// <param name="service">The <see cref="FirefoxDriverService"/> used to initialize the driver.</param>
        public FirefoxDriver(FirefoxDriverService service)
            : this(service, new FirefoxOptions(), RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified path
        /// to the directory containing geckodriver.exe.
        /// </summary>
        /// <param name="geckoDriverDirectory">The full path to the directory containing geckodriver.exe.</param>
        public FirefoxDriver(string geckoDriverDirectory)
            : this(geckoDriverDirectory, new FirefoxOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified path
        /// to the directory containing geckodriver.exe and options.
        /// </summary>
        /// <param name="geckoDriverDirectory">The full path to the directory containing geckodriver.exe.</param>
        /// <param name="options">The <see cref="FirefoxOptions"/> to be used with the Firefox driver.</param>
        public FirefoxDriver(string geckoDriverDirectory, FirefoxOptions options)
            : this(geckoDriverDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified path
        /// to the directory containing geckodriver.exe, options, and command timeout.
        /// </summary>
        /// <param name="geckoDriverDirectory">The full path to the directory containing geckodriver.exe.</param>
        /// <param name="options">The <see cref="FirefoxOptions"/> to be used with the Firefox driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public FirefoxDriver(string geckoDriverDirectory, FirefoxOptions options, TimeSpan commandTimeout)
            : this(FirefoxDriverService.CreateDefaultService(geckoDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified options, driver service, and timeout. Uses the Mozilla-provided Marionette driver implementation.
        /// </summary>
        /// <param name="service">The <see cref="FirefoxDriverService"/> to use.</param>
        /// <param name="options">The <see cref="FirefoxOptions"/> to be used with the Firefox driver.</param>
        public FirefoxDriver(FirefoxDriverService service, FirefoxOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class using the specified options, driver service, and timeout. Uses the Mozilla-provided Marionette driver implementation.
        /// </summary>
        /// <param name="service">The <see cref="FirefoxDriverService"/> to use.</param>
        /// <param name="options">The <see cref="FirefoxOptions"/> to be used with the Firefox driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public FirefoxDriver(FirefoxDriverService service, FirefoxOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), ConvertOptionsToCapabilities(options))
        {
            // Add the custom commands unique to Firefox
            this.CommandExecutor.CommandInfoRepository.TryAddCommand(SetContextCommand, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/moz/context"));
        }

        /// <summary>
        /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
        /// sequences of keystrokes representing file paths and names.
        /// </summary>
        /// <remarks>The Firefox driver does not allow a file detector to be set,
        /// as the server component of the Firefox driver only allows uploads from
        /// the local computer environment. Attempting to set this property has no
        /// effect, but does not throw an exception. If you  are attempting to run
        /// the Firefox driver remotely, use <see cref="RemoteWebDriver"/> in
        /// conjunction with a standalone WebDriver server.</remarks>
        public override IFileDetector FileDetector
        {
            get { return base.FileDetector; }
            set { }
        }

        /// <summary>
        /// Sets the command context used when issuing commands to geckodriver.
        /// </summary>
        /// <param name="context">The <see cref="FirefoxCommandContext"/> value to which to set the context.</param>
        public void SetContext(FirefoxCommandContext context)
        {
            string contextValue = context.ToString().ToLowerInvariant();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["context"] = contextValue;
            Response response = this.Execute(SetContextCommand, parameters);
        }

        /// <summary>
        /// In derived classes, the <see cref="PrepareEnvironment"/> method prepares the environment for test execution.
        /// </summary>
        protected virtual void PrepareEnvironment()
        {
            // Does nothing, but provides a hook for subclasses to do "stuff"
        }

        private static ICapabilities ConvertOptionsToCapabilities(FirefoxOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException("options", "options must not be null");
            }

            return options.ToCapabilities();
        }

        private static FirefoxDriverService CreateService(FirefoxOptions options)
        {
            return FirefoxDriverService.CreateDefaultService();
        }
    }
}
