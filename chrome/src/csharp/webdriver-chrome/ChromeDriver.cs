using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;

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
    public class ChromeDriver : RemoteWebDriver, IFindsByCssSelector, ITakesScreenshot
    {
        #region Constructors
        /// <summary>
        /// Initializes a new instance of the ChromeDriver class with the required extension loaded, and has it connect to a new ChromeCommandExecutor on its port
        /// </summary>
        public ChromeDriver()
            : this(new ChromeProfile(), new ChromeExtension())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified profile and extension.
        /// </summary>
        /// <param name="profile">The profile to use.</param>
        /// <param name="extension">The extension to use.</param>
        private ChromeDriver(ChromeProfile profile, ChromeExtension extension)
            : base(new ChromeCommandExecutor(new ChromeBinary(profile, extension)), DesiredCapabilities.Chrome())
        {
        }
        #endregion

        #region IFindsByCssSelector Members
        /// <summary>
        /// Finds the first element that matches the CSS Selector
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A Web Element</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return FindElement("css", cssSelector);
        }

        /// <summary>
        /// Finds all the elements that match the CSS Selection
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A collection of elements that match</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return FindElements("css", cssSelector);
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

        /// <summary>
        /// Executes a command with this driver .
        /// </summary>
        /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
        /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
        protected override Response Execute(DriverCommand driverCommandToExecute, Dictionary<string, object> parameters)
        {
            Response commandResponse = null;
            try
            {
                commandResponse = base.Execute(driverCommandToExecute, parameters);
            }
            catch (ArgumentException)
            {
                // Exceptions may leave the extension hung, or in an
                // inconsistent state, so we restart Chrome
                StopClient();
                StartClient();
            }
            catch (FatalChromeException)
            {
                // Exceptions may leave the extension hung, or in an inconsistent state, 
                // so we restart Chrome. There is also a legitimate success condition
                // where navigating to about:blank does not cause the extension to 
                // write a response back to the driver.
                StopClient();
                StartClient();
            }

            return commandResponse;
        }

        /// <summary>
        /// Creates a <see cref="RemoteWebElement"/> with the specified ID.
        /// </summary>
        /// <param name="elementId">The ID of this element.</param>
        /// <returns>A <see cref="RemoteWebElement"/> with the specified ID. For the ChromeDriver this will be a <see cref="ChromeWebElement"/>.</returns>
        protected override RemoteWebElement CreateElement(string elementId)
        {
            return new ChromeWebElement(this, elementId);
        }
        #endregion
    }
}
