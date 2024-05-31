// <copyright file="Script.cs" company="WebDriver Committers">
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
using WebDriverBiDi;
using WebDriverBiDi.Log;
using WebDriverBiDi.Session;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism to access WebDriverBiDi events in script and log domains.
    /// </summary>
    [Obsolete("This class is in beta and may change in future releases.")]
    internal class Script : IScript
    {
        private readonly BiDiDriver biDiDriver;

        /// <summary>
        /// Initializes a new instance of the <see cref="Script"/> class
        /// </summary>
        /// <param name="driver">Driver in use</param>
        [Obsolete("This class is in beta and may change in future releases.")]
        public Script(WebDriver driver)
        {
            this.biDiDriver = driver.BiDiDriver;
            this.biDiDriver.Log.EntryAdded += OnEntryAdded;
        }

        /// <summary>
        /// Add and remove handlers for console messages.
        /// </summary>
        [Obsolete("This event is in beta and may change in future releases.")]
        public event EventHandler<EntryAddedEventArgs> ConsoleMessageHandler;

        /// <summary>
        /// Add and remove handlers for console messages.
        /// </summary>
        [Obsolete("This event is in beta and may change in future releases.")]
        public event EventHandler<EntryAddedEventArgs> JavaScriptErrorHandler;

        /// <summary>
        /// Asynchronously starts monitoring for console and JavaScript log entries.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        [Obsolete("This task is in beta and may change in future releases.")]
        public async Task StartMonitoringLogEntries()
        {
            SubscribeCommandParameters subscribe = new();
            subscribe.Events.Add("log.entryAdded");
            await biDiDriver.Session.SubscribeAsync(subscribe).ConfigureAwait(false);
        }

        /// <summary>
        /// Asynchronously stops monitoring for all console and JavaScript log entries.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        [Obsolete("This task is in beta and may change in future releases.")]
        public async Task StopMonitoringLogEntries()
        {
            UnsubscribeCommandParameters unsubscribe = new();
            unsubscribe.Events.Remove("log.entryAdded");
            await biDiDriver.Session.UnsubscribeAsync(unsubscribe).ConfigureAwait(false);
        }
        /// <summary>
        /// Handles the EntryAdded event raised by the sender.
        /// </summary>
        /// <param name="sender">The object that raised the event.</param>
        /// <param name="eventArgs">The event arguments containing information about the added entry.</param>
        private void OnEntryAdded(object? sender, EntryAddedEventArgs eventArgs)
        {
            if (eventArgs.Type == "javascript")
            {
                JavaScriptErrorHandler?.Invoke(this, eventArgs);

            }
            else
            {
                ConsoleMessageHandler?.Invoke(this, eventArgs);
            }
        }
    }
}
