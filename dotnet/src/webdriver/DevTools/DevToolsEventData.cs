// <copyright file="DevToolsEventData.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class containing the data used for an event raised by the DevTools session.
    /// </summary>
    public class DevToolsEventData
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsEventData class.
        /// </summary>
        /// <param name="eventArgsType">The type of the event args for the event to be raised.</param>
        /// <param name="invoker">The method that will be used to invoke the event.</param>
        public DevToolsEventData(Type eventArgsType, Action<object> invoker)
        {
            EventArgsType = eventArgsType;
            EventInvoker = invoker;
        }

        /// <summary>
        /// Gets the type of the event args object for the event.
        /// </summary>
        public Type EventArgsType { get; }

        /// <summary>
        /// The method to called to raise the event.
        /// </summary>
        public Action<object> EventInvoker { get; }
    }
}
