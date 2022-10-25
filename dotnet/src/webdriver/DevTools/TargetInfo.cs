// <copyright file="TargetInfo.cs" company="WebDriver Committers">
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
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Represents information about the target of a DevTools Protocol command
    /// </summary>
    public class TargetInfo
    {
        /// <summary>
        /// Gets the ID of the target.
        /// </summary>
        public string TargetId { get; internal set; }

        /// <summary>
        /// Gets the type of target.
        /// </summary>
        public string Type { get; internal set; }

        /// <summary>
        /// Gets the title of the target.
        /// </summary>
        public string Title { get; internal set; }

        /// <summary>
        /// Gets the URL of the target.
        /// </summary>
        public string Url { get; internal set; }

        /// <summary>
        /// Gets a value indicating if the protocol is attached to the target.
        /// </summary>
        public bool IsAttached { get; internal set; }

        /// <summary>
        /// Gets the ID of the opener of the target.
        /// </summary>
        public string OpenerId { get; internal set; }

        /// <summary>
        /// Gets the browser context ID.
        /// </summary>
        public string BrowserContextId { get; internal set; }
    }
}
