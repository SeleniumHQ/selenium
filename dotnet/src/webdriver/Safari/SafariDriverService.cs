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

using OpenQA.Selenium.Internal;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Exposes the service provided by the native SafariDriver executable.
    /// </summary>
    public sealed class SafariDriverService : DriverService
    {
        private const string DefaultSafariDriverServiceExecutableName = "safaridriver";

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the SafariDriver executable.</param>
        /// <param name="executableFileName">The file name of the SafariDriver executable.</param>
        /// <param name="port">The port on which the SafariDriver executable should listen.</param>
        private SafariDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, port, executableFileName)
        {
        }

        /// <inheritdoc />
        protected override DriverOptions GetDefaultDriverOptions()
        {
            return new SafariOptions();
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder(base.CommandLineArguments);
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

                Uri serviceHealthUri = new Uri(this.ServiceUrl, new Uri("/session/FakeSessionIdForPollingPurposes", UriKind.Relative));

                // Since Firefox driver won't implement the /session end point (because
                // the W3C spec working group stupidly decided that it isn't necessary),
                // we'll attempt to poll for a different URL which has no side effects.
                // We've chosen to poll on the "quit" URL, passing in a nonexistent
                // session id.
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.ConnectionClose = true;
                    httpClient.Timeout = TimeSpan.FromSeconds(5);

                    using (var httpRequest = new HttpRequestMessage(HttpMethod.Delete, serviceHealthUri))
                    {
                        try
                        {
                            using (var httpResponse = Task.Run(async () => await httpClient.SendAsync(httpRequest)).GetAwaiter().GetResult())
                            {
                                isInitialized = (httpResponse.StatusCode == HttpStatusCode.OK
                                        || httpResponse.StatusCode == HttpStatusCode.InternalServerError
                                        || httpResponse.StatusCode == HttpStatusCode.NotFound)
                                    && httpResponse.Content.Headers.ContentType.MediaType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase);
                            }
                        }

                        // Checking the response from deleting a nonexistent session. Note that we are simply
                        // checking that the HTTP status returned is a 200 status, and that the resposne has
                        // the correct Content-Type header. A more sophisticated check would parse the JSON
                        // response and validate its values. At the moment we do not do this more sophisticated
                        // check.
                        catch (Exception ex) when (ex is HttpRequestException || ex is TaskCanceledException)
                        {
                            // Do nothing. The exception is expected, meaning driver service is not initialized.
                        }
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
            return new SafariDriverService(null, null, PortUtilities.FindFreePort());
        }

        /// <summary>
        /// Creates a default instance of the SafariDriverService using a specified path to the SafariDriver executable.
        /// </summary>
        /// <param name="driverPath">The path to the executable or the directory containing the SafariDriver executable.</param>
        /// <returns>A SafariDriverService using a random port.</returns>
        public static SafariDriverService CreateDefaultService(string driverPath)
        {
            string fileName;
            if (File.Exists(driverPath))
            {
                fileName = Path.GetFileName(driverPath);
                driverPath = Path.GetDirectoryName(driverPath);
            }
            else
            {
                fileName = DefaultSafariDriverServiceExecutableName;
            }

            return CreateDefaultService(driverPath, fileName);
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
