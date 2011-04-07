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
        /// Initializes a new instance of the ChromeDriver.
        /// </summary>
        public ChromeDriver()
            : this(ChromeDriverService.CreateDefaultService())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified <see cref="ChromeDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="ChromeDriverService"/> to use.</param>
        private ChromeDriver(ChromeDriverService service)
            : base(new ChromeCommandExecutor(service), DesiredCapabilities.Chrome())
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
