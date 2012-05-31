// <copyright file="SafariCommandMessage.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Creates a WebSockets command message according to the SafariDriver specification.
    /// </summary>
    [JsonObject(MemberSerialization.OptIn)]
    public class SafariCommandMessage
    {
        private string originValue = "webdriver";
        private string typeValue = "command";

        private SafariCommand wrappedCommand;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariCommandMessage"/> class.
        /// </summary>
        /// <param name="command">The <see cref="SafariCommand"/> to wrap.</param>
        public SafariCommandMessage(SafariCommand command)
        {
            this.wrappedCommand = command;
        }

        /// <summary>
        /// Gets the origin of the WebSocket message.
        /// </summary>
        [JsonProperty("origin")]
        public string MessageOrigin
        {
            get { return this.originValue; }
        }

        /// <summary>
        /// Gets the type of the WebSocket message.
        /// </summary>
        [JsonProperty("type")]
        public string MessageType
        {
            get { return this.typeValue; }
        }

        /// <summary>
        /// Gets the wrapped command for transport.
        /// </summary>
        [JsonProperty("command")]
        public SafariCommand Command
        {
            get { return this.wrappedCommand; }
        }
    }
}
