// <copyright file="ChromiumDriver.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenQA.Selenium.DevTools;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Provides an abstract way to access Chromium-based browsers to run tests.
    /// </summary>
    public abstract class ChromiumDriver : WebDriver, ISupportsLogs, IDevTools
    {
        /// <summary>
        /// Accept untrusted SSL Certificates
        /// </summary>
        public static readonly bool AcceptUntrustedCertificates = true;

        private const string GetNetworkConditionsCommand = "getNetworkConditions";
        private const string SetNetworkConditionsCommand = "setNetworkConditions";
        private const string DeleteNetworkConditionsCommand = "deleteNetworkConditions";
        private const string SendChromeCommand = "sendChromeCommand";
        private const string SendChromeCommandWithResult = "sendChromeCommandWithResult";

        private readonly string optionsCapabilityName;
        private DevToolsSession devToolsSession;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumDriver"/> class using the specified
        /// <see cref="ChromiumDriverService"/> and options.
        /// </summary>
        /// <param name="service">The <see cref="ChromiumDriverService"/> to use.</param>
        /// <param name="options">The <see cref="ChromiumOptions"/> used to initialize the driver.</param>
        public ChromiumDriver(ChromiumDriverService service, ChromiumOptions options)
            : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumDriver"/> class using the specified <see cref="ChromiumDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="ChromiumDriverService"/> to use.</param>
        /// <param name="options">The <see cref="ChromiumOptions"/> to be used with the ChromiumDriver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public ChromiumDriver(ChromiumDriverService service, ChromiumOptions options, TimeSpan commandTimeout)
            : base(new DriverServiceCommandExecutor(service, commandTimeout), ConvertOptionsToCapabilities(options))
        {
            this.optionsCapabilityName = options.CapabilityName;

            // Add the custom commands unique to Chrome
            this.AddCustomChromeCommand(GetNetworkConditionsCommand, HttpCommandInfo.GetCommand, "/session/{sessionId}/chromium/network_conditions");
            this.AddCustomChromeCommand(SetNetworkConditionsCommand, HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/network_conditions");
            this.AddCustomChromeCommand(DeleteNetworkConditionsCommand, HttpCommandInfo.DeleteCommand, "/session/{sessionId}/chromium/network_conditions");
            this.AddCustomChromeCommand(SendChromeCommand, HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/send_command");
            this.AddCustomChromeCommand(SendChromeCommandWithResult, HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/send_command_and_get_result");
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumDriver"/> class
        /// </summary>
        /// <param name="commandExecutor">An <see cref="ICommandExecutor"/> object which executes commands for the driver.</param>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        protected ChromiumDriver(ICommandExecutor commandExecutor, ICapabilities desiredCapabilities)
            : base(commandExecutor, desiredCapabilities)
        {
        }

        /// <summary>
        /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
        /// sequences of keystrokes representing file paths and names.
        /// </summary>
        /// <remarks>The Chromium driver does not allow a file detector to be set,
        /// as the server component of the Chromium driver only
        /// allows uploads from the local computer environment. Attempting to set
        /// this property has no effect, but does not throw an exception. If you
        /// are attempting to run the Chromium driver remotely, use <see cref="RemoteWebDriver"/>
        /// in conjunction with a standalone WebDriver server.</remarks>
        public override IFileDetector FileDetector
        {
            get { return base.FileDetector; }
            set { }
        }

        /// <summary>
        /// Gets or sets the network condition emulation for Chromium.
        /// </summary>
        public ChromiumNetworkConditions NetworkConditions
        {
            get
            {
                Response response = this.Execute(GetNetworkConditionsCommand, null);
                return ChromiumNetworkConditions.FromDictionary(response.Value as Dictionary<string, object>);
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "value must not be null");
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters["network_conditions"] = value.ToDictionary();
                this.Execute(SetNetworkConditionsCommand, parameters);
            }
        }

        /// <summary>
        /// Executes a custom Chrome command.
        /// </summary>
        /// <param name="commandName">Name of the command to execute.</param>
        /// <param name="commandParameters">Parameters of the command to execute.</param>
        public void ExecuteChromeCommand(string commandName, Dictionary<string, object> commandParameters)
        {
            if (commandName == null)
            {
                throw new ArgumentNullException("commandName", "commandName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["cmd"] = commandName;
            parameters["params"] = commandParameters;
            this.Execute(SendChromeCommand, parameters);
        }

        /// <summary>
        /// Executes a custom Chrome command.
        /// </summary>
        /// <param name="commandName">Name of the command to execute.</param>
        /// <param name="commandParameters">Parameters of the command to execute.</param>
        /// <returns>An object representing the result of the command.</returns>
        public object ExecuteChromeCommandWithResult(string commandName, Dictionary<string, object> commandParameters)
        {
            if (commandName == null)
            {
                throw new ArgumentNullException("commandName", "commandName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["cmd"] = commandName;
            parameters["params"] = commandParameters;
            Response response = this.Execute(SendChromeCommandWithResult, parameters);
            return response.Value;
        }

        /// <summary>
        /// Creates a session to communicate with a browser using the Chromium Developer Tools debugging protocol.
        /// </summary>
        /// <param name="devToolsProtocolVersion">The version of the Chromium Developer Tools protocol to use. Defaults to autodetect the protocol version.</param>
        /// <returns>The active session to use to communicate with the Chromium Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession()
        {
            return GetDevToolsSession(DevToolsSession.AutoDetectDevToolsProtocolVersion);
        }

        /// <summary>
        /// Creates a session to communicate with a browser using the Chromium Developer Tools debugging protocol.
        /// </summary>
        /// <param name="devToolsProtocolVersion">The version of the Chromium Developer Tools protocol to use. Defaults to autodetect the protocol version.</param>
        /// <returns>The active session to use to communicate with the Chromium Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession(int devToolsProtocolVersion)
        {
            if (this.devToolsSession == null)
            {
                if (!this.Capabilities.HasCapability(this.optionsCapabilityName))
                {
                    throw new WebDriverException("Cannot find " + this.optionsCapabilityName + " capability for driver");
                }

                Dictionary<string, object> options = this.Capabilities.GetCapability(this.optionsCapabilityName) as Dictionary<string, object>;
                if (options == null)
                {
                    throw new WebDriverException("Found " + this.optionsCapabilityName + " capability, but is not an object");
                }

                if (!options.ContainsKey("debuggerAddress"))
                {
                    throw new WebDriverException("Did not find debuggerAddress capability in " + this.optionsCapabilityName);
                }

                string debuggerAddress = options["debuggerAddress"].ToString();
                try
                {
                    DevToolsSession session = new DevToolsSession(debuggerAddress);
                    session.Start(devToolsProtocolVersion).ConfigureAwait(false).GetAwaiter().GetResult();
                    this.devToolsSession = session;
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Unexpected error creating WebSocket DevTools session.", e);
                }
            }

            return this.devToolsSession;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (this.devToolsSession != null)
                {
                    this.devToolsSession.Dispose();
                }
            }

            base.Dispose(disposing);
        }

        private static ICapabilities ConvertOptionsToCapabilities(ChromiumOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException("options", "options must not be null");
            }

            return options.ToCapabilities();
        }

        private void AddCustomChromeCommand(string commandName, string method, string resourcePath)
        {
            HttpCommandInfo commandInfoToAdd = new HttpCommandInfo(method, resourcePath);
            this.CommandExecutor.TryAddCommand(commandName, commandInfoToAdd);
        }
    }
}
