// <copyright file="DevToolsOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Contains options configuring the DevTools session.
    /// </summary>
    public class DevToolsOptions
    {
        /// <summary>
        /// Enables or disables waiting for the debugger when creating a new target. By default WaitForDebuggerOnStart is disabled.
        /// If enabled, all targets will be halted until the runtime.runIfWaitingForDebugger is invoked. 
        /// </summary>
        public bool WaitForDebuggerOnStart { get; set; }
        /// <summary>
        /// The specific version of the Developer Tools debugging protocol to use.
        /// If left NULL the protocol version will be determined automatically based on the browser version.
        /// </summary>
        public int? ProtocolVersion { get; set; }
    }
}
