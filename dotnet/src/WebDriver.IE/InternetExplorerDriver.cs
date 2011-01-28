using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text;
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
        private static int port = FindFreePort();
        private NativeDriverLibrary nativeLibrary = new NativeDriverLibrary();

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class.
        /// </summary>
        public InternetExplorerDriver()
            : base(new Uri("http://localhost:" + port.ToString(CultureInfo.InvariantCulture)), DesiredCapabilities.InternetExplorer())
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

        /// <summary>
        /// Starts the command executor, enabling communication with the browser.
        /// </summary>
        protected override void StartClient()
        {
            this.nativeLibrary.StartServer(port);
        }

        /// <summary>
        /// Stops the command executor, ending further communication with the browser.
        /// </summary>
        protected override void StopClient()
        {
            // StopClient is called by RemoteWebDriver.Dispose, so we should be
            // okay calling lib.Dispose() here.
            this.nativeLibrary.Dispose();
        }

        private static int FindFreePort()
        {
            // Locate a free port on the local machine by binding a socket to
            // an IPEndPoint using IPAddress.Any and port 0. The socket will
            // select a free port.
            Socket portSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            IPEndPoint socketEndPoint = new IPEndPoint(IPAddress.Any, 0);
            portSocket.Bind(socketEndPoint);
            socketEndPoint = (IPEndPoint)portSocket.LocalEndPoint;
            int listeningPort = socketEndPoint.Port;
            portSocket.Close();
            return listeningPort;
        }
    }
}
