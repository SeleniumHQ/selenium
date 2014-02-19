// <copyright file="DriverService.cs" company="WebDriver Committers">
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
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Security.Permissions;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Exposes the service provided by a native WebDriver server executable.
    /// </summary>
    public abstract class DriverService : ICommandServer
    {
        private string driverServicePath;
        private string driverServiceExecutableName;
        private int driverServicePort;
        private bool silent;
        private bool hideCommandPromptWindow;
        private Process driverServiceProcess;

        /// <summary>
        /// Initializes a new instance of the DriverService class.
        /// </summary>
        /// <param name="servicePath">The full path to the directory containing the executable providing the service to drive the browser.</param>
        /// <param name="port">The port on which the driver executable should listen.</param>
        /// <param name="driverServiceExecutableName">The file name of the driver service executable.</param>
        /// <param name="driverServiceDownloadUrl">A URL at which the driver service executable may be downloaded.</param>
        /// <exception cref="ArgumentException">
        /// If the path specified is <see langword="null"/> or an empty string.
        /// </exception>
        /// <exception cref="DriverServiceNotFoundException">
        /// If the specified driver service executable does not exist in the specified directory.
        /// </exception>
        protected DriverService(string servicePath, int port, string driverServiceExecutableName, Uri driverServiceDownloadUrl)
        {
            if (string.IsNullOrEmpty(servicePath))
            {
                throw new ArgumentException("Path to locate driver executable cannot be null or empty.", "servicePath");
            }

            string executablePath = Path.Combine(servicePath, driverServiceExecutableName);
            if (!File.Exists(executablePath))
            {
                throw new DriverServiceNotFoundException(string.Format(CultureInfo.InvariantCulture, "The file {0} does not exist. The driver can be downloaded at {1}", executablePath, driverServiceDownloadUrl));
            }

            this.driverServicePath = servicePath;
            this.driverServiceExecutableName = driverServiceExecutableName;
            this.driverServicePort = port;
        }

        /// <summary>
        /// Gets the Uri of the service.
        /// </summary>
        public Uri ServiceUrl
        {
            get { return new Uri(string.Format(CultureInfo.InvariantCulture, "http://localhost:{0}", this.driverServicePort)); }
        }

        /// <summary>
        /// Gets or sets the port of the service.
        /// </summary>
        public int Port
        {
            get { return this.driverServicePort; }
            set { this.driverServicePort = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the initial diagnostic information is suppressed
        /// when starting the driver server executable. Defaults to <see langword="false"/>, meaning
        /// diagnostic information should be shown by the driver server executable.
        /// </summary>
        public bool SuppressInitialDiagnosticInformation
        {
            get { return this.silent; }
            set { this.silent = value; }
        }

        /// <summary>
        /// Gets a value indicating whether the service is running.
        /// </summary>
        public bool IsRunning
        {
            [SecurityPermission(SecurityAction.Demand)]
            get { return this.driverServiceProcess != null && !this.driverServiceProcess.HasExited; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the command prompt window of the service should be hidden.
        /// </summary>
        public bool HideCommandPromptWindow
        {
            get { return this.hideCommandPromptWindow; }
            set { this.hideCommandPromptWindow = value; }
        }

        /// <summary>
        /// Gets the process ID of the running driver service executable. Returns 0 if the process is not running.
        /// </summary>
        public int ProcessId
        {
            get
            {
                if (this.IsRunning)
                {
                    // There's a slight chance that the Process object is running,
                    // but does not have an ID set. This should be rare, but we
                    // definitely don't want to throw an exception.
                    try
                    {
                        return this.driverServiceProcess.Id;
                    }
                    catch (InvalidOperationException)
                    {
                    }
                }

                return 0;
            }
        }

        /// <summary>
        /// Gets the executable file name of the driver service.
        /// </summary>
        protected string DriverServiceExecutableName
        {
            get { return this.driverServiceExecutableName; }
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected virtual string CommandLineArguments
        {
            get { return string.Format(CultureInfo.InvariantCulture, "--port={0}", this.driverServicePort); }
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="DriverService"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Starts the DriverService.
        /// </summary>
        [SecurityPermission(SecurityAction.Demand)]
        public void Start()
        {
            this.driverServiceProcess = new Process();
            this.driverServiceProcess.StartInfo.FileName = Path.Combine(this.driverServicePath, this.driverServiceExecutableName);
            this.driverServiceProcess.StartInfo.Arguments = this.CommandLineArguments;
            this.driverServiceProcess.StartInfo.UseShellExecute = false;
            this.driverServiceProcess.StartInfo.CreateNoWindow = this.hideCommandPromptWindow;
            this.driverServiceProcess.Start();
            Uri serviceHealthUri = new Uri(this.ServiceUrl, new Uri("status", UriKind.Relative));
            bool processStarted = false;
            DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(20));
            while (!processStarted && DateTime.Now < timeout)
            {
                try
                {
                    HttpWebRequest request = HttpWebRequest.Create(serviceHealthUri) as HttpWebRequest;
                    request.KeepAlive = false;
                    HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                    response.Close();
                    processStarted = true;
                }
                catch (WebException)
                {
                }
            }
        }

        /// <summary>
        /// Finds the specified driver service executable.
        /// </summary>
        /// <param name="executableName">The file name of the executable to find.</param>
        /// <param name="downloadUrl">A URL at which the driver service executable may be downloaded.</param>
        /// <returns>The directory containing the driver service executable.</returns>
        /// <exception cref="DriverServiceNotFoundException">
        /// If the specified driver service executable does not exist in the current directory or in a directory on the system path.
        /// </exception>
        protected static string FindDriverServiceExecutable(string executableName, Uri downloadUrl)
        {
            string serviceDirectory = FileUtilities.FindFile(executableName);
            if (string.IsNullOrEmpty(serviceDirectory))
            {
                throw new DriverServiceNotFoundException(string.Format(CultureInfo.InvariantCulture, "The {0} file does not exist in the current directory or in a directory on the PATH environment variable. The driver can be downloaded at {1}.", executableName, downloadUrl));
            }

            return serviceDirectory;
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="DriverService"/>.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> if the Dispose method was explicitly called; otherwise, <see langword="false"/>.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                this.Stop();
            }
        }

        /// <summary>
        /// Stops the DriverService.
        /// </summary>
        [SecurityPermission(SecurityAction.Demand)]
        private void Stop()
        {
            if (this.driverServiceProcess != null && !this.driverServiceProcess.HasExited)
            {
                Uri shutdownUrl = new Uri(this.ServiceUrl, "/shutdown");
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(10));
                bool processStopped = false;
                while (!processStopped && DateTime.Now < timeout)
                {
                    try
                    {
                        // Issue the shutdown HTTP request, then wait a short while for
                        // the process to have exited. If the process hasn't yet exited,
                        // we'll retry. We wait for exit here, since catching the exception
                        // for a failed HTTP request due to a closed socket is particularly
                        // expensive.
                        HttpWebRequest request = HttpWebRequest.Create(shutdownUrl) as HttpWebRequest;
                        request.KeepAlive = false;
                        HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                        response.Close();
                        this.driverServiceProcess.WaitForExit(3000);
                        processStopped = this.driverServiceProcess.HasExited;
                    }
                    catch (WebException)
                    {
                        processStopped = true;
                    }
                }

                // If at this point, the process still hasn't exited, wait for one
                // last-ditch time, then, if it still hasn't exited, kill it. Note
                // that falling into this branch of code should be exceedingly rare.
                if (!this.driverServiceProcess.HasExited)
                {
                    this.driverServiceProcess.WaitForExit(5000);
                    if (!this.driverServiceProcess.HasExited)
                    {
                        this.driverServiceProcess.Kill();
                    }
                }

                this.driverServiceProcess.Dispose();
                this.driverServiceProcess = null;
            }
        }
    }
}
