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
using OpenQA.Selenium.DevTools;
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
    public class FirefoxDriver : WebDriver, IDevTools
    {
        private const int FirefoxDevToolsProtocolVersion = 85;
        private const string FirefoxDevToolsCapabilityName = "moz:debuggerAddress";
        private const string SetContextCommand = "setContext";
        private const string InstallAddOnCommand = "installAddOn";
        private const string UninstallAddOnCommand = "uninstallAddOn";
        private const string GetFullPageScreenshotCommand = "fullPageScreenshot";

        private DevToolsSession devToolsSession;

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
            this.AddCustomFirefoxCommand(SetContextCommand, HttpCommandInfo.PostCommand, "/session/{sessionId}/moz/context");
            this.AddCustomFirefoxCommand(InstallAddOnCommand, HttpCommandInfo.PostCommand, "/session/{sessionId}/moz/addon/install");
            this.AddCustomFirefoxCommand(UninstallAddOnCommand, HttpCommandInfo.PostCommand, "/session/{sessionId}/moz/addon/uninstall");
            this.AddCustomFirefoxCommand(GetFullPageScreenshotCommand, HttpCommandInfo.GetCommand, "/session/{sessionId}/moz/screenshot/full");
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
        /// Installs a Firefox add-on from a file, typically a .xpi file.
        /// </summary>
        /// <param name="addOnFileToInstall">Full path and file name of the add-on to install.</param>
        public void InstallAddOnFromFile(string addOnFileToInstall)
        {
            if (string.IsNullOrEmpty(addOnFileToInstall))
            {
                throw new ArgumentNullException("addOnFileToInstall", "Add-on file name must not be null or the empty string");
            }

            if (!File.Exists(addOnFileToInstall))
            {
                throw new ArgumentException("File " + addOnFileToInstall + " does not exist", "addOnFileToInstall");
            }

            // Implementation note: There is a version of the install add-on
            // command that can be used with a file name directly, by passing
            // a "path" property in the parameters object of the command. If
            // delegating to the "use the base64-encoded blob" version causes
            // issues, we can change this method to use the file name directly
            // instead.
            byte[] addOnBytes = File.ReadAllBytes(addOnFileToInstall);
            string base64AddOn = Convert.ToBase64String(addOnBytes);
            this.InstallAddOn(base64AddOn);
        }

        /// <summary>
        /// Installs a Firefox add-on.
        /// </summary>
        /// <param name="base64EncodedAddOn">The base64-encoded string representation of the add-on binary.</param>
        public void InstallAddOn(string base64EncodedAddOn)
        {
            if (string.IsNullOrEmpty(base64EncodedAddOn))
            {
                throw new ArgumentNullException("base64EncodedAddOn", "Base64 encoded add-on must not be null or the empty string");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["addon"] = base64EncodedAddOn;
            this.Execute(InstallAddOnCommand, parameters);
        }

        /// <summary>
        /// Uninstalls a Firefox add-on.
        /// </summary>
        /// <param name="addOnId">The ID of the add-on to uninstall.</param>
        public void UninstallAddOn(string addOnId)
        {
            if (string.IsNullOrEmpty(addOnId))
            {
                throw new ArgumentNullException("addOnId", "Base64 encoded add-on must not be null or the empty string");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["id"] = addOnId;
            this.Execute(UninstallAddOnCommand, parameters);
        }

        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the full page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetFullPageScreenshot()
        {
            Response screenshotResponse = this.Execute(GetFullPageScreenshotCommand, null);
            string base64 = screenshotResponse.Value.ToString();
            return new Screenshot(base64);
        }

        /// <summary>
        /// Creates a session to communicate with a browser using the Chromium Developer Tools debugging protocol.
        /// </summary>
        /// <param name="devToolsProtocolVersion">The version of the Chromium Developer Tools protocol to use. Defaults to autodetect the protocol version.</param>
        /// <returns>The active session to use to communicate with the Chromium Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession()
        {
            return GetDevToolsSession(FirefoxDevToolsProtocolVersion);
        }

        /// <summary>
        /// Creates a session to communicate with a browser using the Chromium Developer Tools debugging protocol.
        /// </summary>
        /// <param name="devToolsProtocolVersion">The version of the Chromium Developer Tools protocol to use. Defaults to autodetect the protocol version.</param>
        /// <returns>The active session to use to communicate with the Chromium Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession(int devToolsProtocolVersion)
        {
            if (this.devToolsSession == null)
            {
                if (!this.Capabilities.HasCapability(FirefoxDevToolsCapabilityName))
                {
                    throw new WebDriverException("Cannot find " + FirefoxDevToolsCapabilityName + " capability for driver");
                }

                string debuggerAddress = this.Capabilities.GetCapability(FirefoxDevToolsCapabilityName).ToString();
                try
                {
                    DevToolsSession session = new DevToolsSession(debuggerAddress);
                    session.Start(devToolsProtocolVersion).ConfigureAwait(false).GetAwaiter().GetResult();
                    this.devToolsSession = session;
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Unexpected error creating WebSocket DevTools session.", e);
                }
            }

            return this.devToolsSession;
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

        private void AddCustomFirefoxCommand(string commandName, string method, string resourcePath)
        {
            HttpCommandInfo commandInfoToAdd = new HttpCommandInfo(method, resourcePath);
            this.CommandExecutor.TryAddCommand(commandName, commandInfoToAdd);
        }
    }
}
