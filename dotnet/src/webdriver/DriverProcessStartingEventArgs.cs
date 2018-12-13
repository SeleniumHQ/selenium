// <copyright file="DriverProcessStartingEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides data for the DriverProcessStarting event of a <see cref="DriverService"/> object.
    /// </summary>
    public class DriverProcessStartingEventArgs : EventArgs
    {
        private ProcessStartInfo startInfo;

        /// <summary>
        /// Initializes a new instance of the <see cref="DriverProcessStartingEventArgs"/> class.
        /// </summary>
        /// <param name="startInfo">The <see cref="ProcessStartInfo"/> of the
        /// driver process to be started.</param>
        public DriverProcessStartingEventArgs(ProcessStartInfo startInfo)
        {
            this.startInfo = startInfo;
        }

        /// <summary>
        /// Gets the <see cref="ProcessStartInfo"/> object with which the
        /// driver service process will be started.
        /// </summary>
        public ProcessStartInfo DriverServiceProcessStartInfo
        {
            get { return this.startInfo; }
        }
    }
}
