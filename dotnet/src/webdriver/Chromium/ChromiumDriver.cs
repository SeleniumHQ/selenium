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
using System.Collections.ObjectModel;
using System.IO;
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Provides an abstract way to access Chromium-based browsers to run tests.
    /// </summary>
    public class ChromiumDriver : WebDriver, ISupportsLogs, IDevTools
    {
        /// <summary>
        /// Accept untrusted SSL Certificates
        /// </summary>
        public static readonly bool AcceptUntrustedCertificates = true;

        /// <summary>
        /// Command for executing a Chrome DevTools Protocol command in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string ExecuteCdp = "executeCdpCommand";

        /// <summary>
        /// Command for getting cast sinks in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string GetCastSinksCommand = "getCastSinks";

        /// <summary>
        /// Command for selecting a cast sink in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string SelectCastSinkCommand = "selectCastSink";

        /// <summary>
        /// Command for starting cast tab mirroring in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string StartCastTabMirroringCommand = "startCastTabMirroring";

        /// <summary>
        /// Command for starting cast desktop mirroring in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string StartCastDesktopMirroringCommand = "startCastDesktopMirroring";

        /// <summary>
        /// Command for getting a cast issued message in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string GetCastIssueMessageCommand = "getCastIssueMessage";

        /// <summary>
        /// Command for stopping casting in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string StopCastingCommand = "stopCasting";

        /// <summary>
        /// Command for getting the simulated network conditions in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string GetNetworkConditionsCommand = "getNetworkConditions";

        /// <summary>
        /// Command for setting the simulated network conditions in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string SetNetworkConditionsCommand = "setNetworkConditions";

        /// <summary>
        /// Command for deleting the simulated network conditions in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string DeleteNetworkConditionsCommand = "deleteNetworkConditions";

        /// <summary>
        /// Command for executing a Chrome DevTools Protocol command in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string SendChromeCommand = "sendChromeCommand";

        /// <summary>
        /// Command for executing a Chrome DevTools Protocol command that returns a result in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string SendChromeCommandWithResult = "sendChromeCommandWithResult";

        /// <summary>
        /// Command for launching an app in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string LaunchAppCommand = "launchAppCommand";

        /// <summary>
        /// Command for setting permissions in a driver for a Chromium-based browser.
        /// </summary>
        public static readonly string SetPermissionCommand = "setPermission";

        private readonly string optionsCapabilityName;
        private DevToolsSession devToolsSession;

        private static Dictionary<string, CommandInfo> chromiumCustomCommands = new Dictionary<string, CommandInfo>()
        {
            { GetNetworkConditionsCommand, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/chromium/network_conditions") },
            { SetNetworkConditionsCommand, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/network_conditions") },
            { DeleteNetworkConditionsCommand, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/chromium/network_conditions") },
            { SendChromeCommand, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/send_command") },
            { SendChromeCommandWithResult, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/send_command_and_get_result") },
            { LaunchAppCommand, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/chromium/launch_app") },
            { SetPermissionCommand, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/permissions") }
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumDriver"/> class using the specified <see cref="ChromiumDriverService"/>.
        /// </summary>
        /// <param name="service">The <see cref="ChromiumDriverService"/> to use.</param>
        /// <param name="options">The <see cref="ChromiumOptions"/> to be used with the ChromiumDriver.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        protected ChromiumDriver(ChromiumDriverService service, ChromiumOptions options, TimeSpan commandTimeout)
            : base(GenerateDriverServiceCommandExecutor(service, options, commandTimeout), ConvertOptionsToCapabilities(options))
        {
            this.optionsCapabilityName = options.CapabilityName;
        }

        /// <summary>
        /// Gets the dictionary of custom Chromium commands registered with the driver.
        /// </summary>
        protected static IReadOnlyDictionary<string, CommandInfo> ChromiumCustomCommands
        {
            get { return new ReadOnlyDictionary<string, CommandInfo>(chromiumCustomCommands); }
        }

        /// <summary>
        /// Uses DriverFinder to set Service attributes if necessary when creating the command executor
        /// </summary>
        /// <param name="service"></param>
        /// <param name="commandTimeout"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        private static ICommandExecutor GenerateDriverServiceCommandExecutor(DriverService service, DriverOptions options, TimeSpan commandTimeout)
        {
            if (service.DriverServicePath == null) {
                string fullServicePath = DriverFinder.FullPath(options);
                service.DriverServicePath = Path.GetDirectoryName(fullServicePath);
                service.DriverServiceExecutableName = Path.GetFileName(fullServicePath);
            }
            return new DriverServiceCommandExecutor(service, commandTimeout);
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
        /// Gets a value indicating whether a DevTools session is active.
        /// </summary>
        public bool HasActiveDevToolsSession
        {
            get { return this.devToolsSession != null; }
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
                    throw new ArgumentNullException(nameof(value), "value must not be null");
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters["network_conditions"] = value;
                this.Execute(SetNetworkConditionsCommand, parameters);
            }
        }

        /// <summary>
        /// Launches a Chromium based application.
        /// </summary>
        /// <param name="id">ID of the chromium app to launch.</param>
        public void LaunchApp(string id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id), "id must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["id"] = id;
            this.Execute(LaunchAppCommand, parameters);
        }

        /// <summary>
        /// Set supported permission on browser.
        /// </summary>
        /// <param name="permissionName">Name of item to set the permission on.</param>
        /// <param name="permissionValue">Value to set the permission to.</param>
        public void SetPermission(string permissionName, string permissionValue)
        {
            if (permissionName == null)
            {
                throw new ArgumentNullException(nameof(permissionName), "name must not be null");
            }

            if (permissionValue == null)
            {
                throw new ArgumentNullException(nameof(permissionValue), "value must not be null");
            }

            Dictionary<string, object> nameParameter = new Dictionary<string, object>();
            nameParameter["name"] = permissionName;
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["descriptor"] = nameParameter;
            parameters["state"] = permissionValue;
            this.Execute(SetPermissionCommand, parameters);
        }

        /// <summary>
        /// Executes a custom Chrome Dev Tools Protocol Command.
        /// </summary>
        /// <param name="commandName">Name of the command to execute.</param>
        /// <param name="commandParameters">Parameters of the command to execute.</param>
        /// <returns>An object representing the result of the command, if applicable.</returns>
        public object ExecuteCdpCommand(string commandName, Dictionary<string, object> commandParameters)
        {
            if (commandName == null)
            {
                throw new ArgumentNullException(nameof(commandName), "commandName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["cmd"] = commandName;
            parameters["params"] = commandParameters;
            Response response = this.Execute(ExecuteCdp, parameters);
            return response.Value;
        }

        /// <summary>
        /// Creates a session to communicate with a browser using the Chromium Developer Tools debugging protocol.
        /// </summary>
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
                    Task.Run(async () => await session.StartSession(devToolsProtocolVersion)).GetAwaiter().GetResult();
                    this.devToolsSession = session;
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Unexpected error creating WebSocket DevTools session.", e);
                }
            }

            return this.devToolsSession;
        }

        /// <summary>
        /// Closes a DevTools session.
        /// </summary>
        public void CloseDevToolsSession()
        {
            if (this.devToolsSession != null)
            {
                Task.Run(async () => await this.devToolsSession.StopSession(true)).GetAwaiter().GetResult();
            }
        }

        /// <summary>
        /// Clears simulated network conditions.
        /// </summary>
        public void ClearNetworkConditions()
        {
            this.Execute(DeleteNetworkConditionsCommand, null);
        }

        /// <summary>
        /// Returns the list of cast sinks (Cast devices) available to the Chrome media router.
        /// </summary>
        /// <returns>The list of available sinks.</returns>
        public List<Dictionary<string, string>> GetCastSinks()
        {
            List<Dictionary<string, string>> returnValue = new List<Dictionary<string, string>>();
            Response response = this.Execute(GetCastSinksCommand, null);
            object[] responseValue = response.Value as object[];
            if (responseValue != null)
            {
                foreach (object entry in responseValue)
                {
                    Dictionary<string, object> entryValue = entry as Dictionary<string, object>;
                    if (entryValue != null)
                    {
                        Dictionary<string, string> sink = new Dictionary<string, string>();
                        foreach (KeyValuePair<string, object> pair in entryValue)
                        {
                            sink[pair.Key] = pair.Value.ToString();
                        }

                        returnValue.Add(sink);
                    }
                }
            }
            return returnValue;
        }

        /// <summary>
        /// Selects a cast sink (Cast device) as the recipient of media router intents (connect or play).
        /// </summary>
        /// <param name="deviceName">Name of the target sink (device).</param>
        public void SelectCastSink(string deviceName)
        {
            if (deviceName == null)
            {
                throw new ArgumentNullException(nameof(deviceName), "deviceName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["sinkName"] = deviceName;
            this.Execute(SelectCastSinkCommand, parameters);
        }

        /// <summary>
        /// Initiates tab mirroring for the current browser tab on the specified device.
        /// </summary>
        /// <param name="deviceName">Name of the target sink (device).</param>
        public void StartTabMirroring(string deviceName)
        {
            if (deviceName == null)
            {
                throw new ArgumentNullException(nameof(deviceName), "deviceName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["sinkName"] = deviceName;
            this.Execute(StartCastTabMirroringCommand, parameters);
        }

        /// <summary>
        /// Initiates mirroring of the desktop on the specified device.
        /// </summary>
        /// <param name="deviceName">Name of the target sink (device).</param>
        public void StartDesktopMirroring(string deviceName)
        {
            if (deviceName == null)
            {
                throw new ArgumentNullException(nameof(deviceName), "deviceName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["sinkName"] = deviceName;
            this.Execute(StartCastDesktopMirroringCommand, parameters);
        }

        /// <summary>
        /// Returns the error message if there is any issue in a Cast session.
        /// </summary>
        /// <returns>An error message.</returns>
        public String GetCastIssueMessage()
        {
            Response response = this.Execute(GetCastIssueMessageCommand, null);
            return (string)response.Value;
        }

        /// <summary>
        /// Stops casting from media router to the specified device, if connected.
        /// </summary>
        /// <param name="deviceName">Name of the target sink (device).</param>
        public void StopCasting(string deviceName)
        {
            if (deviceName == null)
            {
                throw new ArgumentNullException(nameof(deviceName), "deviceName must not be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["sinkName"] = deviceName;
            this.Execute(StopCastingCommand, parameters);
        }

        /// <summary>
        /// Stops the driver from running
        /// </summary>
        /// <param name="disposing">if its in the process of disposing</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (this.devToolsSession != null)
                {
                    this.devToolsSession.Dispose();
                    this.devToolsSession = null;
                }
            }

            base.Dispose(disposing);
        }

        private static ICapabilities ConvertOptionsToCapabilities(ChromiumOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options), "options must not be null");
            }

            return options.ToCapabilities();
        }
    }
}
