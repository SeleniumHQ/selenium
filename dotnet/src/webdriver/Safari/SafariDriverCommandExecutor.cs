// <copyright file="SafariDriverCommandExecutor.cs" company="WebDriver Committers">
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
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Provides a way of executing Commands using the SafariDriver.
    /// </summary>
    public class SafariDriverCommandExecutor : ICommandExecutor, IDisposable
    {
        private bool isDisposed;
        private SafariDriverServer server;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverCommandExecutor"/> class.
        /// </summary>
        /// <param name="options">The <see cref="SafariOptions"/> used to create the command executor.</param>
        public SafariDriverCommandExecutor(SafariOptions options)
        {
            this.server = new SafariDriverServer(options);
        }

        /// <summary>
        /// Gets the repository of objects containin information about commands.
        /// </summary>
        public CommandInfoRepository CommandInfoRepository
        {
            get { return null; }
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
                throw new ArgumentNullException("commandToExecute", "Command to execute cannot be null");
            }

            Response toReturn = null;
            if (commandToExecute.Name == DriverCommand.NewSession)
            {
                this.server.Start();
            }

            // Use a try-catch block to catch exceptions for the Quit
            // command, so that we can get the finally block.
            try
            {
                toReturn = this.server.SendCommand(commandToExecute);
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
        /// Releases all resources used by the <see cref="SafariDriverCommandExecutor"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="SafariDriverCommandExecutor"/> and
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
