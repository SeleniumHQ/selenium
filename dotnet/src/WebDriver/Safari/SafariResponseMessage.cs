// <copyright file="SafariResponseMessage.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Creates a WebSockets response message according to the SafariDriver specification.
    /// </summary>
    public class SafariResponseMessage
    {
        private string id;
        private string origin;
        private string type;
        private Response internalResponse;

        /// <summary>
        /// Gets or sets the ID of the command.
        /// </summary>
        [JsonProperty("id")]
        public string Id
        {
            get { return this.id; }
            set { this.id = value; }
        }

        /// <summary>
        /// Gets or sets the origin of the response message.
        /// </summary>
        [JsonProperty("origin")]
        public string MessageOrigin
        {
            get { return this.origin; }
            set { this.origin = value; }
        }

        /// <summary>
        /// Gets or sets the type of the response message.
        /// </summary>
        [JsonProperty("type")]
        public string MessageType
        {
            get { return this.type; }
            set { this.type = value; }
        }

        /// <summary>
        /// Gets or sets the internal response for the given command.
        /// </summary>
        [JsonProperty("response")]
        public Response Response
        {
            get { return this.internalResponse; }
            set { this.internalResponse = value; }
        }

        /// <summary>
        /// Returns a new <see cref="Response"/> from a JSON-encoded string.
        /// </summary>
        /// <param name="value">The JSON string to deserialize into a <see cref="Response"/>.</param>
        /// <returns>A <see cref="Response"/> object described by the JSON string.</returns>
        public static SafariResponseMessage FromJson(string value)
        {
            return JsonConvert.DeserializeObject<SafariResponseMessage>(value);
        }
    }
}
