// <copyright file="PhantomJSDriver.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Provides a way to access PhantomJS to run your tests by creating a PhantomJSDriver instance
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
    ///         driver = new PhantomJSDriver();
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
    [Obsolete("Development of PhantomJS has been discontinued, and the project archived. The PhantomJS driver will be removed in a future release.")]
    public class PhantomJSDriver : RemoteWebDriver
    {
        /// <summary>
        /// Command name of the PhantomJS-specific command to execute native script in PhantomJS.
        /// </summary>
        private const string CommandExecutePhantomScript = "executePhantomScript";

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class.
        /// </summary>
        public PhantomJSDriver()
            : this(new PhantomJSOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class with the desired options.
        /// </summary>
        /// <param name="options">The <see cref="PhantomJSOptions"/> used to initialize the driver.</param>
        public PhantomJSDriver(PhantomJSOptions options)
            : this(PhantomJSDriverService.CreateDefaultService(), options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified driver service.
        /// </summary>
        /// <param name="service">The <see cref="PhantomJSDriverService"/> used to initialize the driver.</param>
        public PhantomJSDriver(PhantomJSDriverService service)
            : this(service, new PhantomJSOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified path
        /// to the directory containing PhantomJS.exe.
        /// </summary>
        /// <param name="phantomJSDriverServerDirectory">The full path to the directory containing PhantomJS.exe.</param>
        public PhantomJSDriver(string phantomJSDriverServerDirectory)
            : this(phantomJSDriverServerDirectory, new PhantomJSOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified path
        /// to the directory containing PhantomJS.exe and options.
        /// </summary>
        /// <param name="phantomJSDriverServerDirectory">The full path to the directory containing PhantomJS.exe.</param>
        /// <param name="options">The <see cref="PhantomJSOptions"/> used to initialize the driver.</param>
        public PhantomJSDriver(string phantomJSDriverServerDirectory, PhantomJSOptions options)
            : this(phantomJSDriverServerDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified path
        /// to the directory containing PhantomJS.exe, options, and command timeout.
        /// </summary>
        /// <param name="phantomJSDriverServerDirectory">The full path to the directory containing PhantomJS.exe.</param>
        /// <param name="options">The <see cref="PhantomJSOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public PhantomJSDriver(string phantomJSDriverServerDirectory, PhantomJSOptions options, TimeSpan commandTimeout)
            : this(PhantomJSDriverService.CreateDefaultService(phantomJSDriverServerDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified
        /// <see cref="PhantomJSDriverService"/> and options.
        /// </summary>
        /// <param name="service">The <see cref="PhantomJSDriverService"/> to use.</param>
        /// <param name="options">The <see cref="PhantomJSOptions"/> used to initialize the driver.</param>
        public PhantomJSDriver(PhantomJSDriverService service, PhantomJSOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriver"/> class using the specified <see cref="PhantomJSDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="PhantomJSDriverService"/> to use.</param>
        /// <param name="options">The <see cref="PhantomJSOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public PhantomJSDriver(PhantomJSDriverService service, PhantomJSOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout, false), ConvertOptionsToCapabilities(options))
        {
            // Add the custom commandInfo of PhantomJSDriver
            CommandInfo commandInfo = new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/phantom/execute");
            this.CommandExecutor.CommandInfoRepository.TryAddCommand(CommandExecutePhantomScript, commandInfo);
        }

        /// <summary>
        /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
        /// sequences of keystrokes representing file paths and names.
        /// </summary>
        /// <remarks>The PhantomJS driver does not allow a file detector to be set,
        /// as PhantomJS only allows uploads from the local computer environment.
        /// Attempting to set this property has no effect, but does not throw an
        /// exception. If you are attempting to run the PhantomJS driver remotely,
        /// use <see cref="RemoteWebDriver"/> in conjunction with a standalone
        /// WebDriver server.</remarks>
        public override IFileDetector FileDetector
        {
            get { return base.FileDetector; }
            set { }
        }

        /// <summary>
        /// Execute a PhantomJS script fragment. Provides extra functionality not found in WebDriver
        /// but available in PhantomJS.
        /// </summary>
        /// <param name="script">The fragment of PhantomJS JavaScript to execute.</param>
        /// <param name="args">List of arguments to pass to the function that the script is wrapped in.
        /// These can accessed in the script as 'arguments[0]', 'arguments[1]','arguments[2]', etc
        /// </param>
        /// <returns>The result of the evaluation.</returns>
        /// <remarks>
        /// <para>
        /// See the <a href="https://github.com/ariya/phantomjs/wiki/API-Reference">PhantomJS API</a>
        /// for details on what is available.
        /// </para>
        /// <para>
        /// A 'page' variable pointing to currently selected page is available for use.
        /// If there is no page yet, one is created.
        /// </para>
        /// <para>
        /// When overriding any callbacks be sure to wrap in a try/catch block, as failures
        /// may cause future WebDriver calls to fail.
        /// </para>
        /// <para>
        /// Certain callbacks are used by GhostDriver (the PhantomJS WebDriver implementation)
        /// already. Overriding these may cause the script to fail. It's a good idea to check
        /// for existing callbacks before overriding.
        /// </para>
        /// </remarks>
        public object ExecutePhantomJS(string script, params object[] args)
        {
            return this.ExecuteScriptCommand(script, CommandExecutePhantomScript, args);
        }

        private static ICapabilities ConvertOptionsToCapabilities(PhantomJSOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException("options", "options must not be null");
            }

            return options.ToCapabilities();
        }
    }
}
