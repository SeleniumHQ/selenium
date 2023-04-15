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

using Newtonsoft.Json.Linq;
using System;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class containing data for sending commands to the DevTools session.
    /// </summary>
    public class DevToolsCommandSettings
    {
        /// <summary>
        /// Initializes a new instance of <see cref="DevToolsCommandSettings"/>
        /// </summary>
        /// <param name="commandName">The name of the command.</param>
        /// <exception cref="ArgumentNullException">Thrown when the <paramref name="commandName"/> is null or whitespace.</exception>
        public DevToolsCommandSettings(string commandName)
        {
            if (string.IsNullOrWhiteSpace(commandName))
            {
                throw new ArgumentNullException(nameof(commandName));
            }

            CommandName = commandName;
        }

        /// <summary>
        /// Gets or sets the SessionId for this command.
        /// </summary>
        public string SessionId { get; set; }

        /// <summary>
        /// Gets the name for this command.
        /// </summary>
        public string CommandName { get; }
        /// <summary>
        /// Gets or sets the parameters for this command.
        /// </summary>
        public JToken CommandParameters { get; set; }
    }
}
