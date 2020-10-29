// <copyright file="DevToolsCommandData.cs" company="WebDriver Committers">
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

using System.Threading;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// The information for each DevTools command
    /// </summary>
    public class DevToolsCommandData
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsCommandData class.
        /// </summary>
        /// <param name="commandId">The ID of the commmand execution.</param>
        /// <param name="commandName">The method name of the DevTools command.</param>
        /// <param name="commandParameters">The parameters of the DevTools command.</param>
        public DevToolsCommandData(long commandId, string commandName, JToken commandParameters)
            : this(commandId, null, commandName, commandParameters)
        {
        }

        /// <summary>
        /// Initializes a new instance of the DevToolsCommandData class.
        /// </summary>
        /// <param name="commandId">The ID of the commmand execution.</param>
        /// <param name="sessionId">The session ID of the current command execution.</param>
        /// <param name="commandName">The method name of the DevTools command.</param>
        /// <param name="commandParameters">The parameters of the DevTools command.</param>
        public DevToolsCommandData(long commandId, string sessionId, string commandName, JToken commandParameters)
        {
            CommandId = commandId;
            SessionId = sessionId;
            CommandName = commandName;
            CommandParameters = commandParameters;
            SyncEvent = new ManualResetEventSlim(false);
        }

        /// <summary>
        /// Gets the session ID of the command.
        /// </summary>
        [JsonProperty("sessionId", NullValueHandling = NullValueHandling.Ignore)]
        public string SessionId { get; }

        /// <summary>
        /// Gets the numeric ID of the command execution.
        /// </summary>
        [JsonProperty("id")]
        public long CommandId { get; }

        /// <summary>
        /// Gets the method name of the command.
        /// </summary>
        [JsonProperty("method")]
        public string CommandName { get; }

        /// <summary>
        /// Gets the parameters for the command.
        /// </summary>
        [JsonProperty("params")]
        public JToken CommandParameters { get; }

        /// <summary>
        /// Gets a ManualResetEventSlim on which execution of the command can be synchronized.
        /// </summary>
        [JsonIgnore]
        public ManualResetEventSlim SyncEvent { get; }

        /// <summary>
        /// Get or sets the result of the command execution.
        /// </summary>
        [JsonIgnore]
        public JToken Result { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the command resulted in an error response.
        /// </summary>
        [JsonIgnore]
        public bool IsError { get; set; }
    }
}
