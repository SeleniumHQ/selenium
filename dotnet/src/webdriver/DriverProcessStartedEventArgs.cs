// <copyright file="DriverProcessStartedEventArgs.cs" company="WebDriver Committers">
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
using System.Diagnostics;
using System.IO;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides data for the DriverProcessStarted event of a <see cref="DriverService"/> object.
    /// </summary>
    public class DriverProcessStartedEventArgs : EventArgs
    {
        private int processId;
        private StreamReader standardOutputStreamReader;
        private StreamReader standardErrorStreamReader;

        /// <summary>
        /// Initializes a new instance of the <see cref="DriverProcessStartingEventArgs"/> class.
        /// </summary>
        /// <param name="startInfo">The <see cref="ProcessStartInfo"/> of the
        /// driver process to be started.</param>
        public DriverProcessStartedEventArgs(Process driverProcess)
        {
            this.processId = driverProcess.Id;
            if (driverProcess.StartInfo.RedirectStandardOutput && !driverProcess.StartInfo.UseShellExecute)
            {
                this.standardOutputStreamReader = driverProcess.StandardOutput;
            }

            if (driverProcess.StartInfo.RedirectStandardError && !driverProcess.StartInfo.UseShellExecute)
            {
                this.standardErrorStreamReader = driverProcess.StandardError;
            }
        }

        /// <summary>
        /// Gets the unique ID of the driver executable process.
        /// </summary>
        public int ProcessId
        {
            get { return this.processId; }
        }

        /// <summary>
        /// Gets a <see cref="StreamReader"/> object that can be used to read the contents
        /// printed to stdout by a driver service process.
        /// </summary>
        public StreamReader StandardOutputStreamReader
        {
            get { return this.standardOutputStreamReader; }
        }

        /// <summary>
        /// Gets a <see cref="StreamReader"/> object that can be used to read the contents
        /// printed to stderr by a driver service process.
        /// </summary>
        public StreamReader StandardErrorStreamReader
        {
            get { return standardErrorStreamReader; }
        }
    }
}
