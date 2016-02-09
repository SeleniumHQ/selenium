// <copyright file="FirefoxDriverCommandExecutor.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides a way of executing Commands using the FirefoxDriver.
    /// </summary>
    public class FirefoxDriverCommandExecutor : ICommandExecutor, IDisposable
    {
        private FirefoxDriverServer server;
        private HttpCommandExecutor internalExecutor;
        private TimeSpan commandTimeout;
        private bool isDisposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriverCommandExecutor"/> class.
        /// </summary>
        /// <param name="binary">The <see cref="FirefoxBinary"/> on which to make the connection.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> creating the connection.</param>
        /// <param name="host">The name of the host on which to connect to the Firefox extension (usually "localhost").</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public FirefoxDriverCommandExecutor(FirefoxBinary binary, FirefoxProfile profile, string host, TimeSpan commandTimeout)
        {
            this.server = new FirefoxDriverServer(binary, profile, host);
            this.commandTimeout = commandTimeout;
        }

        /// <summary>
        /// Gets the repository of objects containin information about commands.
        /// </summary>
        public CommandInfoRepository CommandInfoRepository
        {
            get { return this.internalExecutor.CommandInfoRepository; }
        }

        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public Response Execute(Command commandToExecute)
        {
            if (commandToExecute == null)
            {
                throw new ArgumentNullException("commandToExecute", "Command may not be null");
            }

            Response toReturn = null;
            if (commandToExecute.Name == DriverCommand.NewSession)
            {
                this.server.Start();
                this.internalExecutor = new HttpCommandExecutor(this.server.ExtensionUri, this.commandTimeout);
            }

            // Use a try-catch block to catch exceptions for the Quit
            // command, so that we can get the finally block.
            try
            {
                toReturn = this.internalExecutor.Execute(commandToExecute);
            }
            finally
            {
                if (commandToExecute.Name == DriverCommand.Quit)
                {
                    this.Dispose();
                }
            }

            return toReturn;
        }

        /// <summary>
        /// Releases all resources used by the <see cref="FirefoxDriverCommandExecutor"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="FirefoxDriverCommandExecutor"/> and
        /// optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release managed and resources;
        /// <see langword="false"/> to only release unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!this.isDisposed)
            {
                if (disposing)
                {
                    this.server.Dispose();
                }

                this.isDisposed = true;
            }
        }
    }
}
