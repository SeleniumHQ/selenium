// <copyright file="SafariDriverCommandExecutor.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Provides a way of executing Commands using the SafariDriver.
    /// </summary>
    public class SafariDriverCommandExecutor : ICommandExecutor, IDisposable
    {
        private static Random tempFileGenerator = new Random();
        private string temporaryDirectoryPath;
        private string safariExecutableLocation;
        private Process safariProcess;
        private SafariDriverServer server;
        private SafariDriverConnection connection;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverCommandExecutor"/> class.
        /// </summary>
        /// <param name="port">The port on which the executor communicates with the extension.</param>
        public SafariDriverCommandExecutor(int port)
            : this(port, GetDefaultSafariLocation())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverCommandExecutor"/> class.
        /// </summary>
        /// <param name="port">The port on which the executor communicates with the extension.</param>
        /// <param name="safariLocation">The location of the Safari executable</param>
        public SafariDriverCommandExecutor(int port, string safariLocation)
        {
            this.server = new SafariDriverServer(port);
            this.safariExecutableLocation = safariLocation;
        }

        /// <summary>
        /// Starts the command executor.
        /// </summary>
        public void Start()
        {
            this.server.Start();
            string connectFileName = this.PrepareConnectFile();
            this.LaunchSafariProcess(connectFileName);
            this.connection = this.server.WaitForConnection(TimeSpan.FromSeconds(45));
            this.DeleteConnectFile();
            if (this.connection == null)
            {
                throw new WebDriverException("Did not receive a connection from the Safari extension. Please verify that it is properly installed and is the proper version.");
            }
        }

        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public Response Execute(Command commandToExecute)
        {
            return this.connection.Send(commandToExecute);
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
        /// Releases all resources associated with this <see cref="SafariDriverCommandExecutor"/>.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> if the Dispose method was explicitly called; otherwise, <see langword="false"/>.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (this.safariProcess != null)
                {
                    this.CloseSafariProcess();
                    this.safariProcess.Dispose();
                }

                this.server.Dispose();
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

        private void LaunchSafariProcess(string initialPage)
        {
            this.safariProcess = new Process();
            this.safariProcess.StartInfo.FileName = this.safariExecutableLocation;
            this.safariProcess.StartInfo.Arguments = initialPage;
            this.safariProcess.Start();
        }

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
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "SafariDriver", randomNumber);
            this.temporaryDirectoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            string tempFileName = Path.Combine(this.temporaryDirectoryPath, "connect.html");
            string contents = string.Format(CultureInfo.InvariantCulture, "<!DOCTYPE html><script>window.location = '{0}';</script>", this.server.ServerUri.ToString());
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
    }
}
