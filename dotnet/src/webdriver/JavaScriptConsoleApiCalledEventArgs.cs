// <copyright file="JavaScriptConsoleApiCalledEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides data for the JavaScriptConsoleApiCalled event.
    /// </summary>
    public class JavaScriptConsoleApiCalledEventArgs : EventArgs
    {
        private string messageContent;
        private DateTime messageTimeStamp;
        private string messageType;

        /// <summary>
        /// Gets or sets the content of the message written to the JavaScript console
        /// </summary>
        public string MessageContent { get => messageContent; set => messageContent = value; }

        /// <summary>
        /// Gets or sets the time stamp of the message written to the JavaScript console.
        /// </summary>
        public DateTime MessageTimeStamp { get => messageTimeStamp; set => messageTimeStamp = value; }

        /// <summary>
        /// Gets or sets the type of message written to the JavaScript console.
        /// </summary>
        public string MessageType { get => messageType; set => messageType = value; }
    }
}
