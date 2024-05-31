// <copyright file="IScript.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;
using WebDriverBiDi.Log;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface providing access to WebDriverBiDi events in script and log domains.
    /// </summary>
    [Obsolete("This class is in beta and may change in future releases.")]
    public interface IScript
    {
        /// <summary>
        /// Add and remove handlers for console messages.
        /// </summary>
        [Obsolete("This event is in beta and may change in future releases.")]
        event EventHandler<EntryAddedEventArgs> ConsoleMessageHandler;

        /// <summary>
        /// Add and remove handlers for console messages.
        /// </summary>
        [Obsolete("This event is in beta and may change in future releases.")]
        event EventHandler<EntryAddedEventArgs> JavaScriptErrorHandler;

        /// <summary>
        /// Asynchronously starts monitoring for console and JavaScript log entries.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        [Obsolete("This task is in beta and may change in future releases.")]
        Task StartMonitoringLogEntries();

        /// <summary>
        /// Asynchronously stops monitoring for console and JavaScript log entries.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        [Obsolete("This task is in beta and may change in future releases.")]
        Task StopMonitoringLogEntries();
    }
}
