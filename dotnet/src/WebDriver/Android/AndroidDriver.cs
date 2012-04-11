// <copyright file="AndroidDriver.cs" company="WebDriver Committers">
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
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Android
{
    /// <summary>
    /// Provides a mechanism to write tests against an Android device
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
    ///         driver = new AndroidDriver();
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
    /// <remarks>
    /// Using the Android driver requires the Android device or emulator
    /// to be running, and the WebDriver application be active on the device.
    /// </remarks>
    public class AndroidDriver : RemoteWebDriver, ITakesScreenshot, IRotatable
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AndroidDriver"/> class.
        /// </summary>
        public AndroidDriver() :
            this(GetDefaultUrl())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="AndroidDriver"/> class,
        /// communicating with the device at a specific URL.
        /// </summary>
        /// <param name="remoteAddress">The URL of the WebDriver application on the Android device.</param>
        public AndroidDriver(string remoteAddress) :
            this(new Uri(remoteAddress))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="AndroidDriver"/> class,
        /// communicating with the device at a specific URL.
        /// </summary>
        /// <param name="remoteAddress">The URL of the WebDriver application on the Android device.</param>
        public AndroidDriver(Uri remoteAddress) :
            base(remoteAddress, GetAndroidCapabilities())
        {
        }

        #region IRotatable Members
        /// <summary>
        /// Gets or sets the screen orientation of the browser on the device.
        /// </summary>
        public ScreenOrientation Orientation
        {
            get
            {
                Response orientationResponse = Execute(DriverCommand.GetOrientation, null);
                return (ScreenOrientation)Enum.Parse(typeof(ScreenOrientation), orientationResponse.Value.ToString(), true);
            }

            set
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("orientation", value.ToString().ToUpperInvariant());
                this.Execute(DriverCommand.SetOrientation, parameters);
            }
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

        private static Uri GetDefaultUrl()
        {
            return new Uri("http://localhost:8080/wd/hub");
        }

        private static DesiredCapabilities GetAndroidCapabilities()
        {
            DesiredCapabilities caps = DesiredCapabilities.Android();
            caps.SetCapability(CapabilityType.TakesScreenshot, true);
            caps.SetCapability(CapabilityType.Rotatable, true);
            ////caps.SetCapability(CapabilityType.SUPPORTS_BROWSER_CONNECTION, true);
            return caps;
        }
    }
}
