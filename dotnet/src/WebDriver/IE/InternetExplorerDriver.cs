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
        private static int serverPort;
        private static bool useLegacyServer;
        private InternetExplorerDriverServer server;

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class.
        /// </summary>
        public InternetExplorerDriver()
            : this(0)
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class for the specified port.
        /// </summary>
        /// <param name="port">The port to use to communicate with the IE server.</param>
        public InternetExplorerDriver(int port)
            : this(port, new InternetExplorerOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class with the desired options.
        /// </summary>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        public InternetExplorerDriver(InternetExplorerOptions options)
            : this(0, options)
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class for the specified port and desired capabilities.
        /// </summary>
        /// <param name="port">The port to use to communicate with the IE server.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        public InternetExplorerDriver(int port, InternetExplorerOptions options)
            : this(port, options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class for the specified port, options, and command timeout.
        /// </summary>
        /// <param name="port">The port to use to communicate with the IE server.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public InternetExplorerDriver(int port, InternetExplorerOptions options, TimeSpan commandTimeout)
            : base(GetCommandExecutor(port, options.ToCapabilities(), commandTimeout), options.ToCapabilities())
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing InternetExplorerDriver.exe.
        /// </summary>
        /// <param name="internetExplorerDriverDirectory">The full path to the directory containing InternetExplorerDriver.exe.</param>
        public InternetExplorerDriver(string internetExplorerDriverDirectory)
            : this(internetExplorerDriverDirectory, new InternetExplorerOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing InternetExplorerDriver.exe and command timeout.
        /// </summary>
        /// <param name="internetExplorerDriverDirectory">The full path to the directory containing InternetExplorerDriver.exe.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        public InternetExplorerDriver(string internetExplorerDriverDirectory, InternetExplorerOptions options)
            : this(InternetExplorerDriverService.CreateDefaultService(internetExplorerDriverDirectory), options, TimeSpan.FromSeconds(60))
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified path to the directory containing InternetExplorerDriver.exe and command timeout.
        /// </summary>
        /// <param name="internetExplorerDriverDirectory">The full path to the directory containing InternetExplorerDriver.exe.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public InternetExplorerDriver(string internetExplorerDriverDirectory, InternetExplorerOptions options, TimeSpan commandTimeout)
            : this(InternetExplorerDriverService.CreateDefaultService(internetExplorerDriverDirectory), options, commandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class using the specified <see cref="DriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="DriverService"/> to use.</param>
        /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        private InternetExplorerDriver(DriverService service, InternetExplorerOptions options, TimeSpan commandTimeout)
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

        private static ICommandExecutor GetCommandExecutor(int port, ICapabilities capabilities, TimeSpan commandTimeout)
        {
            // This method should be completely removed when the standalone server
            // is in widespread use.
            ICommandExecutor executor = null;
            if (capabilities.HasCapability("useLegacyInternalServer"))
            {
                useLegacyServer = (bool)capabilities.GetCapability("useLegacyInternalServer");
                executor = new HttpCommandExecutor(CreateServerUri(port), commandTimeout);
            }
            else
            {
                useLegacyServer = false;
                try
                {
                    executor = new DriverServiceCommandExecutor(InternetExplorerDriverService.CreateDefaultService(), commandTimeout);
                }
                catch (DriverServiceNotFoundException ex)
                {
                    throw new WebDriverException("You will need to use add InternetExplorerDriver.UseLegacyInternalServer to the desired capabilities to use the internal native code server library. This functionality will be deprecated in favor of the standalone InternetExplorerDriver.exe server.", ex);
                }
            }

            return executor;
        }

        /// <summary>
        /// Starts the command executor, enabling communication with the browser.
        /// </summary>
        protected override void StartClient()
        {
            if (useLegacyServer)
            {
                if (this.server == null)
                {
                    this.server = new InternetExplorerDriverServer();
                }

                if (this.server != null)
                {
                    if (!InternetExplorerDriverServer.IsRunning)
                    {
                        this.server.Start(serverPort);
                    }
                }
            }
        }

        /// <summary>
        /// Stops the command executor, ending further communication with the browser.
        /// </summary>
        protected override void StopClient()
        {
            if (this.server != null)
            {
                // StopClient is called by RemoteWebDriver.Dispose, so we should be
                // okay calling lib.Dispose() here.
                this.server.Dispose();
            }
        }

        private static Uri CreateServerUri(int port)
        {
            if (serverPort == 0)
            {
                if (port == 0)
                {
                    port = FindFreePort();
                }

                serverPort = port;
            }

            return new Uri("http://localhost:" + serverPort.ToString(CultureInfo.InvariantCulture));
        }

        private static int FindFreePort()
        {
            // Locate a free port on the local machine by binding a socket to
            // an IPEndPoint using IPAddress.Any and port 0. The socket will
            // select a free port.
            int listeningPort = 0;
            Socket portSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            try
            {
                IPEndPoint socketEndPoint = new IPEndPoint(IPAddress.Any, 0);
                portSocket.Bind(socketEndPoint);
                socketEndPoint = (IPEndPoint)portSocket.LocalEndPoint;
                listeningPort = socketEndPoint.Port;
            }
            finally
            {
                portSocket.Close();
            }

            return listeningPort;
        }
    }
}
