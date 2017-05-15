// <copyright file="StoreAppsOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Winium
{
    using System.Collections.Generic;

    using OpenQA.Selenium.Remote;

    /// <summary>
    /// Class to manage options specific to <see cref="WiniumDriver"/> 
    /// wich uses <see href="https://github.com/2gis/Winium.StoreApps">Winium.StoreApps</see>.
    /// </summary>
    public class StoreAppsOptions : IWiniumOptions
    {
        private const string ApplicationPathOption = "app";
        private const string FilesOption = "files";
        private const string DeviceNameOption = "deviceName";
        private const string LaunchTimeoutOption = "launchTimeout";
        private const string LaunchDelayOption = "launchDelay";
        private const string DebugConnectToRunningAppOption = "debugConnectToRunningApp";
        private const string DependenciesOption = "dependencies";

        private string applicationPath;
        private Dictionary<string, string> files;
        private string deviceName;
        private int? launchTimeout;
        private int? launchDelay;
        private bool? debugConnectToRunningApp;
        private List<string> dependencies;

        /// <summary>
        /// Gets or sets the absolute local path to an .appx file to be installed and launched. 
        /// This capability is not required if debugConnectToRunningApp is specified.
        /// </summary>
        public string ApplicationPath
        {
            set { this.applicationPath = value; }
        }

        /// <summary>
        /// Gets or sets the files.
        /// Each key of the dictionary is "local file path", each corresponding value is "remote file path"
        /// </summary>
        public Dictionary<string, string> Files
        {
            set { this.files = value; }
        }

        /// <summary>
        /// Gets or sets name of emulator to use for running test. 
        /// Note that this capability is not required, if no device name is specified, 
        /// then a default emulator is used.You can specify only partial name, 
        /// first emulator that starts with specified deviceName will be selected. 
        /// </summary>
        public string DeviceName
        {
            set { this.deviceName = value; }
        }

        /// <summary>
        /// Gets or sets maximum timeout in milliseconds, to be waited for application to launch.
        /// </summary>
        public int LaunchTimeout
        {
            set { this.launchTimeout = value; }
        }

        /// <summary>
        /// Gets or sets launch delay in milliseconds, to be waited to let visuals to initialize after application launched (after successful ping or timeout). 
        /// Use it if the system running emulator is slow.
        /// </summary>
        public int LaunchDelay
        {
            set { this.launchDelay = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether debug connect to running app.
        /// If true, then application starting step are skipped.
        /// </summary>
        public bool DebugConnectToRunningApp
        {
            set { this.debugConnectToRunningApp = value; }
        }

        /// <summary>
        /// Gets or sets a list of dependencies.
        /// </summary>
        public List<string> Dependencies
        {
            set { this.dependencies = value; }
        }

        /// <summary>
        /// Convert options to DesiredCapabilities for Winium StoreApps Driver 
        /// </summary>
        /// <returns>The DesiredCapabilities for Winium StoreApps Driver with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            var capabilityDictionary = new Dictionary<string, object> { { ApplicationPathOption, this.applicationPath } };

            if (this.files.Count > 0)
            {
                capabilityDictionary.Add(FilesOption, this.files);
            }

            if (this.debugConnectToRunningApp.HasValue)
            {
                capabilityDictionary.Add(DebugConnectToRunningAppOption, this.debugConnectToRunningApp);
            }

            if (!string.IsNullOrEmpty(this.deviceName))
            {
                capabilityDictionary.Add(DeviceNameOption, this.deviceName);
            }

            if (this.launchTimeout.HasValue)
            {
                capabilityDictionary.Add(LaunchTimeoutOption, this.launchTimeout);
            }

            if (this.launchDelay.HasValue)
            {
                capabilityDictionary.Add(LaunchDelayOption, this.launchDelay);
            }

            if (this.dependencies.Count > 0)
            {
                capabilityDictionary.Add(DependenciesOption, this.dependencies);
            }

            return new DesiredCapabilities(capabilityDictionary);
        }
    }
}
