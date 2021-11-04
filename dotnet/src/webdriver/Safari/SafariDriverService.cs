// <copyright file="SafariDriverService.cs" company="WebDriver Committers">
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
using System.Net;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Exposes the service provided by the native SafariDriver executable.
    /// </summary>
    public sealed class SafariDriverService : DriverService
    {
        private const string DefaultSafariDriverServiceExecutableName = "safaridriver";
        private const string DefaultSafariDriverServiceExecutablePath = "/usr/bin";

        private static readonly Uri SafariDriverDownloadUrl = new Uri("http://apple.com");

        private bool useLegacyProtocol;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the SafariDriver executable.</param>
        /// <param name="executableFileName">The file name of the SafariDriver executable.</param>
        /// <param name="port">The port on which the SafariDriver executable should listen.</param>
        private SafariDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, port, executableFileName, SafariDriverDownloadUrl)
        {
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use the default open-source project
        /// dialect of the protocol instead of the default dialect compliant with the
        /// W3C WebDriver Specification.
        /// </summary>
        /// <remarks>
        /// This is only valid for versions of the driver for Safari that target Safari 12
        /// or later, and will result in an error if used with prior versions of the driver.
        /// </remarks>
        public bool UseLegacyProtocol
        {
            get { return this.useLegacyProtocol; }
            set { this.useLegacyProtocol = value; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
                if (this.useLegacyProtocol)
                {
                    argsBuilder.Append(" --legacy");
                }

                return argsBuilder.ToString();
            }
        }

        /// <summary>
        /// Gets a value indicating the time to wait for the service to terminate before forcing it to terminate.
        /// For the Safari driver, there is no time for termination
        /// </summary>
        protected override TimeSpan TerminationTimeout
        {
            // Use a very small timeout for terminating the Safari driver,
            // because the executable does not have a clean shutdown command,
            // which means we have to kill the process. Using a short timeout
            // gets us to the termination point much faster.
            get { return TimeSpan.FromMilliseconds(100); }
        }

        /// <summary>
        /// Gets a value indicating whether the service has a shutdown API that can be called to terminate
        /// it gracefully before forcing a termination.
        /// </summary>
        protected override bool HasShutdown
        {
            // The Safari driver executable does not have a clean shutdown command,
            // which means we have to kill the process.
            get { return false; }
        }

        /// <summary>
        /// Gets a value indicating whether the service is responding to HTTP requests.
        /// </summary>
        protected override bool IsInitialized
        {
            get
            {
                bool isInitialized = false;
                try
                {
                    // Since Firefox driver won't implement the /session end point (because
                    // the W3C spec working group stupidly decided that it isn't necessary),
                    // we'll attempt to poll for a different URL which has no side effects.
                    // We've chosen to poll on the "quit" URL, passing in a nonexistent
                    // session id.
                    Uri serviceHealthUri = new Uri(this.ServiceUrl, new Uri("/session/FakeSessionIdForPollingPurposes", UriKind.Relative));
                    HttpWebRequest request = HttpWebRequest.Create(serviceHealthUri) as HttpWebRequest;
                    request.KeepAlive = false;
                    request.Timeout = 5000;
                    request.Method = "DELETE";
                    HttpWebResponse response = request.GetResponse() as HttpWebResponse;

                    // Checking the response from deleting a nonexistent session. Note that we are simply
                    // checking that the HTTP status returned is a 200 status, and that the resposne has
                    // the correct Content-Type header. A more sophisticated check would parse the JSON
                    // response and validate its values. At the moment we do not do this more sophisticated
                    // check.
                    isInitialized = response.StatusCode == HttpStatusCode.OK && response.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase);
                    response.Close();
                }
                catch (WebException ex)
                {
                    // Because the Firefox driver (incorrectly) does not allow quit on a
                    // nonexistent session to succeed, this will throw a WebException,
                    // which means we're reduced to using exception handling for flow control.
                    // This situation is highly undesirable, and in fact is a horrible code
                    // smell, but the implementation leaves us no choice. So we will check for
                    // the known response code and content type header, just like we would for
                    // the success case. Either way, a valid HTTP response instead of a socket
                    // error would tell us that the HTTP server is responding to requests, which
                    // is really what we want anyway.
                    HttpWebResponse errorResponse = ex.Response as HttpWebResponse;
                    if (errorResponse != null)
                    {
                        isInitialized = (errorResponse.StatusCode == HttpStatusCode.InternalServerError && errorResponse.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase)) || (errorResponse.StatusCode == HttpStatusCode.NotFound);
                    }
                    else
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

                return isInitialized;
            }
        }

        /// <summary>
        /// Creates a default instance of the SafariDriverService.
        /// </summary>
        /// <returns>A SafariDriverService that implements default settings.</returns>
        public static SafariDriverService CreateDefaultService()
        {
            return CreateDefaultService(DefaultSafariDriverServiceExecutablePath);
        }

        /// <summary>
        /// Creates a default instance of the SafariDriverService using a specified path to the SafariDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the SafariDriver executable.</param>
        /// <returns>A SafariDriverService using a random port.</returns>
        public static SafariDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, DefaultSafariDriverServiceExecutableName);
        }

        /// <summary>
        /// Creates a default instance of the SafariDriverService using a specified path to the SafariDriver executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the SafariDriver executable.</param>
        /// <param name="driverExecutableFileName">The name of the SafariDriver executable file.</param>
        /// <returns>A SafariDriverService using a random port.</returns>
        public static SafariDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new SafariDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }
    }
}
