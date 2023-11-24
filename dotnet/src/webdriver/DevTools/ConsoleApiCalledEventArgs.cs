// <copyright file="ConsoleApiCalledEventArgs.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Event arguments present when the ConsoleApiCalled event is raised.
    /// </summary>
    public class ConsoleApiCalledEventArgs : EventArgs
    {
        /// <summary>
        /// Gets the time stanp when the browser's console API is called.
        /// </summary>
        public DateTime Timestamp { get; internal set; }

        /// <summary>
        /// Gets the type of message when the browser's console API is called.
        /// </summary>
        public string Type { get; internal set; }

        /// <summary>
        /// Gets the arguments of the call to the browser's console API.
        /// </summary>
        public ReadOnlyCollection<ConsoleApiArgument> Arguments { get; internal set; }
    }
}
