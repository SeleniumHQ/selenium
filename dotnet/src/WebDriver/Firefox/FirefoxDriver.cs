// <copyright file="FirefoxDriver.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Firefox.Internal;
using OpenQA.Selenium.Internal;
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
    public class FirefoxDriver : RemoteWebDriver, ITakesScreenshot
    {
        #region Public members
        /// <summary>
        /// The name of the ICapabilities setting to use to define a custom Firefox profile.
        /// </summary>
        public static readonly string ProfileCapabilityName = "firefox_profile";
        
        /// <summary>
        /// The name of the ICapabilities setting to use to define a custom location for the
        /// Firefox executable.
        /// </summary>
        public static readonly string BinaryCapabilityName = "firefox_binary";
        #endregion

        #region Private members
        /// <summary>
        /// The default port on which to communicate with the Firefox extension.
        /// </summary>
        public static readonly int DefaultPort = 7055;

        /// <summary>
        /// Indicates whether native events is enabled by default for this platform.
        /// </summary>
        public static readonly bool DefaultEnableNativeEvents = Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows);

        /// <summary>
        /// Indicates whether the driver will accept untrusted SSL certificates.
        /// </summary>
        public static readonly bool AcceptUntrustedCertificates = true;

        private FirefoxBinary binary;

        private FirefoxProfile profile;
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class.
        /// </summary>
        public FirefoxDriver() :
            this(new FirefoxBinary(), null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given profile.
        /// </summary>
        /// <param name="profile">A <see cref="FirefoxProfile"/> object representing the profile settings
        /// to be used in starting Firefox.</param>
        public FirefoxDriver(FirefoxProfile profile) :
            this(new FirefoxBinary(), profile)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given set of capabilities.
        /// </summary>
        /// <param name="capabilities">The <see cref="ICapabilities"/> object containing the desired
        /// capabilities of this FirefoxDriver.</param>
        public FirefoxDriver(ICapabilities capabilities)
            : this(ExtractBinary(capabilities), ExtractProfile(capabilities))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given profile and binary environment.
        /// </summary>
        /// <param name="binary">A <see cref="FirefoxBinary"/> object representing the operating system 
        /// environmental settings used when running Firefox.</param>
        /// <param name="profile">A <see cref="FirefoxProfile"/> object representing the profile settings
        /// to be used in starting Firefox.</param>
        public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile)
            : this(binary, profile, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given profile, binary environment, and timeout value.
        /// </summary>
        /// <param name="binary">A <see cref="FirefoxBinary"/> object representing the operating system 
        /// environmental settings used when running Firefox.</param>
        /// <param name="profile">A <see cref="FirefoxProfile"/> object representing the profile settings
        /// to be used in starting Firefox.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile, TimeSpan commandTimeout)
            : base(CreateExtensionConnection(binary, profile, commandTimeout), DesiredCapabilities.Firefox())
        {
            this.binary = binary;
            this.profile = profile;
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets the FirefoxBinary and its details for subclasses
        /// </summary>
        protected FirefoxBinary Binary
        {
            get { return this.binary; }
        }

        /// <summary>
        /// Gets the FirefoxProfile that is currently in use by subclasses
        /// </summary>
        protected FirefoxProfile Profile
        {
            get { return this.profile; }
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
            Response screenshotResponse = Execute(DriverCommand.Screenshot, null);
            string base64 = screenshotResponse.Value.ToString();

            // ... and convert it.
            return new Screenshot(base64);
        }
        #endregion

        #region Support methods
        /// <summary>
        /// Starts the command executor, enabling communication with the browser.
        /// </summary>
        protected override void StartClient()
        {
            try
            {
                ExtensionConnection connection = (ExtensionConnection)this.CommandExecutor;
                connection.Profile.AddWebDriverExtension();
                ((ExtensionConnection)this.CommandExecutor).Start();
            }
            catch (IOException e)
            {
                throw new WebDriverException("An error occurred while connecting to Firefox", e);
            }
        }

        /// <summary>
        /// Stops the command executor, ending further communication with the browser.
        /// </summary>
        protected override void StopClient()
        {
            ((ExtensionConnection)this.CommandExecutor).Quit();
        }

        /// <summary>
        /// In derived classes, the <see cref="PrepareEnvironment"/> method prepares the environment for test execution.
        /// </summary>
        protected void PrepareEnvironment()
        {
            // Does nothing, but provides a hook for subclasses to do "stuff"
        }

        /// <summary>
        /// Creates a <see cref="RemoteWebElement"/> with the specified ID.
        /// </summary>
        /// <param name="elementId">The ID of this element.</param>
        /// <returns>A <see cref="RemoteWebElement"/> with the specified ID. For the FirefoxDriver this will be a <see cref="FirefoxWebElement"/>.</returns>
        protected override RemoteWebElement CreateElement(string elementId)
        {
            return new FirefoxWebElement(this, elementId);
        }
        #endregion

        #region Private methods
        private static FirefoxBinary ExtractBinary(ICapabilities capabilities)
        {
            if (capabilities.GetCapability(BinaryCapabilityName) != null)
            {
                string file = capabilities.GetCapability(BinaryCapabilityName).ToString();
                return new FirefoxBinary(file);
            }
 
            return new FirefoxBinary();
        }

        private static FirefoxProfile ExtractProfile(ICapabilities capabilities)
        {
            FirefoxProfile profile = new FirefoxProfile();
            if (capabilities.GetCapability(ProfileCapabilityName) != null)
            {
                object raw = capabilities.GetCapability(ProfileCapabilityName);
                FirefoxProfile rawAsProfile = raw as FirefoxProfile;
                string rawAsString = raw as string;
                if (rawAsProfile != null)
                {
                    profile = rawAsProfile;
                }
                else if (rawAsString != null)
                {
                    try
                    {
                        profile = FirefoxProfile.FromBase64String(rawAsString);
                    }
                    catch (IOException e)
                    {
                        throw new WebDriverException("Unable to create profile from specified string", e);
                    }
                }
            }

            if (capabilities.GetCapability(CapabilityType.Proxy) != null)
            {
                Proxy proxy = null;
                object raw = capabilities.GetCapability(CapabilityType.Proxy);
                Proxy rawAsProxy = raw as Proxy;
                Dictionary<string, object> rawAsMap = raw as Dictionary<string, object>;
                if (rawAsProxy != null)
                {
                    proxy = rawAsProxy;
                }
                else if (rawAsMap != null)
                {
                    proxy = new Proxy(rawAsMap);
                }

                profile.SetProxyPreferences(proxy);
            }

            if (capabilities.GetCapability(CapabilityType.AcceptSslCertificates) != null)
            {
                bool acceptCerts = (bool)capabilities.GetCapability(CapabilityType.AcceptSslCertificates);
                profile.AcceptUntrustedCertificates = acceptCerts;
            }

            return profile;
        }

        private static ExtensionConnection CreateExtensionConnection(FirefoxBinary binary, FirefoxProfile profile, TimeSpan commandTimeout)
        {
            FirefoxProfile profileToUse = profile;

            string suggestedProfile = Environment.GetEnvironmentVariable("webdriver.firefox.profile");
            if (profileToUse == null && suggestedProfile != null)
            {
                profileToUse = new FirefoxProfileManager().GetProfile(suggestedProfile);
            }
            else if (profileToUse == null)
            {
                profileToUse = new FirefoxProfile();
            }

            ExtensionConnection extension = new ExtensionConnection(binary, profileToUse, "localhost", commandTimeout);
            return extension;
        }
        #endregion
    }
}
