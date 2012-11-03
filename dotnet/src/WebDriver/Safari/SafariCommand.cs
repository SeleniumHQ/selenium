// <copyright file="SafariCommand.cs" company="WebDriver Committers">
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
    /// Wraps a command object to give it a unique ID as required by the Safari extension.
    /// </summary>
    [JsonObject(MemberSerialization.OptIn)]
    public class SafariCommand : Command
    {
        private Guid id;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariCommand"/> class.
        /// </summary>
        /// <param name="command">The <see cref="Command"/> object used as a base for this <see cref="SafariCommand"/>.</param>
        public SafariCommand(Command command)
            : base(command.SessionId, command.Name, command.Parameters)
        {
            this.id = Guid.NewGuid();
        }

        /// <summary>
        /// Gets the ID of the command.
        /// </summary>
        [JsonProperty("id")]
        public string Id
        {
            get { return this.id.ToString(); }
        }
    }
}
