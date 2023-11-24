// <copyright file="DevToolsEventReceivedEventArgs.cs" company="WebDriver Committers">
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
using Newtonsoft.Json.Linq;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Event data used when receiving events from the DevTools session.
    /// </summary>
    public class DevToolsEventReceivedEventArgs : EventArgs
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsEventReceivedEventArgs class.
        /// </summary>
        /// <param name="domainName">The domain on which the event is to be raised.</param>
        /// <param name="eventName">The name of the event to be raised.</param>
        /// <param name="eventData">The data for the event to be raised.</param>
        public DevToolsEventReceivedEventArgs(string domainName, string eventName, JToken eventData)
        {
            DomainName = domainName;
            EventName = eventName;
            EventData = eventData;
        }

        /// <summary>
        /// Gets the domain on which the event is to be raised.
        /// </summary>
        public string DomainName { get; private set; }

        /// <summary>
        /// Gets the name of the event to be raised.
        /// </summary>
        public string EventName { get; private set; }

        /// <summary>
        /// Gets the data with which the event is to be raised.
        /// </summary>
        public JToken EventData { get; private set; }
    }
}
