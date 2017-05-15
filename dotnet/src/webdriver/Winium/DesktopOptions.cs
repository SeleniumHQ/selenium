// <copyright file="DesktopOptions.cs" company="WebDriver Committers">
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
    using System;
    using System.Collections.Generic;

    using OpenQA.Selenium.Remote;

    /// <summary>
    /// The keyboard simulator type.
    /// </summary>
    public enum KeyboardSimulatorType
    {
        /// <summary>
        /// Based on SendKeys Class.<see href="https://msdn.microsoft.com/en-us/library/system.windows.forms.sendkeys(v=vs.110).aspx">See more</see>.
        /// </summary>
        BasedOnWindowsFormsSendKeysClass,

        /// <summary>
        /// Based on Windows Input Simulator.
        /// For additional methods should be cast to the KeyboardSimulatorExt. <see href="http://inputsimulator.codeplex.com/">See more</see>.
        /// </summary>
        BasedOnInputSimulatorLib
    }


    /// <summary>
    /// Class to manage options specific to <see cref="WiniumDriver"/> 
    /// wich uses <see href="https://github.com/2gis/Winium.Desktop">Winium.Desktop</see>.
    /// </summary>
    public class DesktopOptions : IWiniumOptions
    {
        private const string ApplicationPathOption = "app";
        private const string ArgumentsOption = "args";
        private const string KeyboardSimulatorOption = "keyboardSimulator";
        private const string LaunchDelayOption = "launchDelay";
        private const string DebugConnectToRunningAppOption = "debugConnectToRunningApp";

        private string applicationPath;
        private string arguments;
        private bool? debugConnectToRunningApp;
        private KeyboardSimulatorType? keyboardSimulator;
        private int? launchDelay;

       /// <summary>
        /// Gets or sets the absolute local path to an .exe file to be started. 
        /// This capability is not required if debugConnectToRunningApp is specified.
        /// </summary>
        public string ApplicationPath
        {
            set { this.applicationPath = value; }
        }

        /// <summary>
        /// Gets or sets startup argunments of the application under test.
        /// </summary>
        public string Arguments
        {
            set { this.arguments = value; }
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
        /// Gets or sets the keyboard simulator type.
        /// </summary>
        public KeyboardSimulatorType KeyboardSimulator
        {
            set { this.keyboardSimulator = value; }
        }

        /// <summary>
        /// Gets or sets the launch delay in milliseconds, to be waited to let visuals to initialize after application started.
        /// </summary>
        public int LaunchDelay
        {
            set { this.launchDelay = value; }
        }

        /// <summary>
        /// Convert options to DesiredCapabilities for Winium Desktop Driver 
        /// </summary>
        /// <returns>The DesiredCapabilities for Winium Desktop Driver with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            var capabilityDictionary = new Dictionary<string, object> { { ApplicationPathOption, this.applicationPath } };

            if (!string.IsNullOrEmpty(this.arguments))
            {
                capabilityDictionary.Add(ArgumentsOption, this.arguments);
            }

            if (this.debugConnectToRunningApp.HasValue)
            {
                capabilityDictionary.Add(DebugConnectToRunningAppOption, this.debugConnectToRunningApp);
            }

            if (this.keyboardSimulator.HasValue)
            {
                capabilityDictionary.Add(KeyboardSimulatorOption, this.keyboardSimulator);
            }

            if (this.launchDelay.HasValue)
            {
                capabilityDictionary.Add(LaunchDelayOption, this.launchDelay);
            }

            return new DesiredCapabilities(capabilityDictionary);
        }
    }
}
