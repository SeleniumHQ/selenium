// <copyright file="Command.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to send commands to the remote server
    /// </summary>
    public class Command
    {
        private SessionId commandSessionId;
        private string commandName;
        private Dictionary<string, object> commandParameters = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the <see cref="Command"/> class using a command name and a JSON-encoded string for the parameters.
        /// </summary>
        /// <param name="name">Name of the command</param>
        /// <param name="jsonParameters">Parameters for the command as a JSON-encoded string.</param>
        public Command(string name, string jsonParameters)
            : this(null, name, ConvertParametersFromJson(jsonParameters))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Command"/> class for a Session
        /// </summary>
        /// <param name="sessionId">Session ID the driver is using</param>
        /// <param name="name">Name of the command</param>
        /// <param name="parameters">Parameters for that command</param>
        public Command(SessionId sessionId, string name, Dictionary<string, object> parameters)
        {
            this.commandSessionId = sessionId;
            if (parameters != null)
            {
                this.commandParameters = parameters;
            }

            this.commandName = name;
        }

        /// <summary>
        /// Gets the SessionID of the command
        /// </summary>
        [JsonProperty("sessionId")]
        public SessionId SessionId
        {
            get { return this.commandSessionId; }
        }

        /// <summary>
        /// Gets the command name
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get { return this.commandName; }
        }

        /// <summary>
        /// Gets the parameters of the command
        /// </summary>
        [JsonProperty("parameters")]
        public Dictionary<string, object> Parameters
        {
            get { return this.commandParameters; }
        }

        /// <summary>
        /// Gets the parameters of the command as a JSON-encoded string.
        /// </summary>
        public string ParametersAsJsonString
        {
            get
            {
                string parametersString = string.Empty;
                if (this.commandParameters != null && this.commandParameters.Count > 0)
                {
                    parametersString = JsonConvert.SerializeObject(this.commandParameters);
                }

                if (string.IsNullOrEmpty(parametersString))
                {
                    parametersString = "{}";
                }

                return parametersString;
            }
        }

        /// <summary>
        /// Returns a string of the Command object
        /// </summary>
        /// <returns>A string representation of the Command Object</returns>
        public override string ToString()
        {
            return string.Concat("[", this.SessionId, "]: ", this.Name, " ", this.Parameters.ToString());
        }

        /// <summary>
        /// Gets the command parameters as a <see cref="Dictionary{K, V}"/>, with a string key, and an object value.
        /// </summary>
        /// <param name="value">The JSON-encoded string representing the command parameters.</param>
        /// <returns>A <see cref="Dictionary{K, V}"/> with a string keys, and an object value. </returns>
        private static Dictionary<string, object> ConvertParametersFromJson(string value)
        {
            Dictionary<string, object> parameters = JsonConvert.DeserializeObject<Dictionary<string, object>>(value, new ResponseValueJsonConverter());
            return parameters;
        }
    }
}
