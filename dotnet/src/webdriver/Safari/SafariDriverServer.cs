// <copyright file="SafariDriverServer.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Safari.Internal;
using System.Diagnostics;
using System.IO;
using System.Security.Permissions;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Provides the WebSockets server for communicating with the Safari extension.
    /// </summary>
    public class SafariDriverServer : ICommandServer
    {
        private WebSocketServer webSocketServer;
        private Queue<SafariDriverConnection> connections = new Queue<SafariDriverConnection>();
        private Uri serverUri;
        private string temporaryDirectoryPath;
        private string safariExecutableLocation;
        private Process safariProcess;
        private SafariDriverConnection connection;
        private SafariDriverExtension extension;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverServer"/> class using the specified options.
        /// </summary>
        /// <param name="options">The <see cref="SafariOptions"/> defining the browser settings.</param>
        public SafariDriverServer(SafariOptions options)
        {
            int webSocketPort = options.Port;
            if (webSocketPort == 0)
            {
                webSocketPort = PortUtilities.FindFreePort();
            }

            this.webSocketServer = new WebSocketServer(webSocketPort, "ws://localhost/wd");
            this.webSocketServer.Opened += new EventHandler<ConnectionEventArgs>(this.ServerOpenedEventHandler);
            this.webSocketServer.Closed += new EventHandler<ConnectionEventArgs>(this.ServerClosedEventHandler);
            this.webSocketServer.StandardHttpRequestReceived += new EventHandler<StandardHttpRequestReceivedEventArgs>(this.ServerStandardHttpRequestReceivedEventHandler);
            this.serverUri = new Uri(string.Format(CultureInfo.InvariantCulture, "http://localhost:{0}/", webSocketPort.ToString(CultureInfo.InvariantCulture)));
            if (string.IsNullOrEmpty(options.SafariLocation))
            {
                this.safariExecutableLocation = GetDefaultSafariLocation();
            }
            else
            {
                this.safariExecutableLocation = options.SafariLocation;
            }

            this.extension = new SafariDriverExtension(options.CustomExtensionPath, options.SkipExtensionInstallation);
        }
        
        /// <summary>
        /// Starts the server.
        /// </summary>
        public void Start()
        {
            this.webSocketServer.Start();
            this.extension.Install();
            string connectFileName = this.PrepareConnectFile();
            this.LaunchSafariProcess(connectFileName);
            this.connection = this.WaitForConnection(TimeSpan.FromSeconds(45));
            this.DeleteConnectFile();
            if (this.connection == null)
            {
                throw new WebDriverException("Did not receive a connection from the Safari extension. Please verify that it is properly installed and is the proper version.");
            }
        }

        /// <summary>
        /// Sends a command to the server.
        /// </summary>
        /// <param name="commandToSend">The <see cref="Command"/> to send.</param>
        /// <returns>The command <see cref="Response"/>.</returns>
        public Response SendCommand(Command commandToSend)
        {
            return this.connection.Send(commandToSend);
        }

        /// <summary>
        /// Waits for a connection to be established with the server by the Safari browser extension.
        /// </summary>
        /// <param name="timeout">A <see cref="TimeSpan"/> containing the amount of time to wait for the connection.</param>
        /// <returns>A <see cref="SafariDriverConnection"/> representing the connection to the browser.</returns>
        public SafariDriverConnection WaitForConnection(TimeSpan timeout)
        {
            SafariDriverConnection foundConnection = null;
            DateTime end = DateTime.Now.Add(timeout);
            while (this.connections.Count == 0 && DateTime.Now < end)
            {
                Thread.Sleep(250);
            }

            if (this.connections.Count > 0)
            {
                foundConnection = this.connections.Dequeue();
            }

            return foundConnection;
        }

        /// <summary>
        /// Releases all resources used by the <see cref="SafariDriverServer"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="SafariDriverServer"/> and optionally 
        /// releases the managed resources.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release managed and resources; 
        /// <see langword="false"/> to only release unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                this.webSocketServer.Dispose();
                if (this.safariProcess != null)
                {
                    this.CloseSafariProcess();
                    this.extension.Uninstall();
                    this.safariProcess.Dispose();
                }
            }
        }

        private static string GetDefaultSafariLocation()
        {
            string safariPath = string.Empty;
            if (Environment.OSVersion.Platform == PlatformID.Win32NT)
            {
                // Safari remains a 32-bit application. Use a hack to look for it
                // in the 32-bit program files directory. If a 64-bit version of
                // Safari for Windows is released, this needs to be revisited.
                string programFilesDirectory = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
                if (Directory.Exists(programFilesDirectory + " (x86)"))
                {
                    programFilesDirectory += " (x86)";
                }

                safariPath = Path.Combine(programFilesDirectory, Path.Combine("Safari", "safari.exe"));
            }
            else
            {
                safariPath = "/Applications/Safari.app/Contents/MacOS/Safari";
            }

            return safariPath;
        }

        [SecurityPermission(SecurityAction.Demand)]
        private void LaunchSafariProcess(string initialPage)
        {
            this.safariProcess = new Process();
            this.safariProcess.StartInfo.FileName = this.safariExecutableLocation;
            this.safariProcess.StartInfo.Arguments = string.Format(CultureInfo.InvariantCulture, "\"{0}\"", initialPage);
            this.safariProcess.Start();
        }

        [SecurityPermission(SecurityAction.Demand)]
        private void CloseSafariProcess()
        {
            if (this.safariProcess != null && !this.safariProcess.HasExited)
            {
                this.safariProcess.Kill();
                while (!this.safariProcess.HasExited)
                {
                    Thread.Sleep(250);
                }
            }
        }

        private string PrepareConnectFile()
        {
            string directoryName = FileUtilities.GenerateRandomTempDirectoryName("SafariDriverConnect.{0}");
            this.temporaryDirectoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            string tempFileName = Path.Combine(this.temporaryDirectoryPath, "connect.html");
            string contents = string.Format(CultureInfo.InvariantCulture, "<!DOCTYPE html><script>window.location = '{0}';</script>", this.serverUri.ToString());
            Directory.CreateDirectory(this.temporaryDirectoryPath);
            using (FileStream stream = File.Create(tempFileName))
            {
                stream.Write(Encoding.UTF8.GetBytes(contents), 0, Encoding.UTF8.GetByteCount(contents));
            }

            return tempFileName;
        }

        private void DeleteConnectFile()
        {
            Directory.Delete(this.temporaryDirectoryPath, true);
        }

        private void ServerOpenedEventHandler(object sender, ConnectionEventArgs e)
        {
            this.connections.Enqueue(new SafariDriverConnection(e.Connection));
        }

        private void ServerClosedEventHandler(object sender, ConnectionEventArgs e)
        {
        }

        private void ServerStandardHttpRequestReceivedEventHandler(object sender, StandardHttpRequestReceivedEventArgs e)
        {
            const string PageSource = @"<!DOCTYPE html>
  <script>
    window.onload = function() {{
      window.postMessage({{
        'type': 'connect',
        'origin': 'webdriver',
        'url': 'ws://localhost:{0}/wd'
        }}, '*');
    }};
  </script>";

            string redirectPage = string.Format(CultureInfo.InvariantCulture, PageSource, this.webSocketServer.Port.ToString(CultureInfo.InvariantCulture));
            StringBuilder builder = new StringBuilder();
            builder.AppendLine("HTTP/1.1 200");
            builder.AppendLine("Content-Length: " + redirectPage.Length.ToString(CultureInfo.InvariantCulture));
            builder.AppendLine("Connection:close");
            builder.AppendLine();
            builder.AppendLine(redirectPage);
            e.Connection.SendRaw(builder.ToString());
        }
    }
}
