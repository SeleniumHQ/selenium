// <copyright file="ChromiumAndroidOptions.cs" company="WebDriver Committers">
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

using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Generates the capabilities for automating Chromium applications on Android
    /// </summary>
    public class ChromiumAndroidOptions : AndroidOptions
    {
        private string androidProcess;
        private bool androidUseRunningApp;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromiumAndroidOptions"/> class.
        /// </summary>
        /// <param name="androidPackage"></param>
        public ChromiumAndroidOptions(string androidPackage) : base(androidPackage)
        {
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use an already running app.
        /// </summary>
        public bool UseRunningApp
        {
            get { return this.androidUseRunningApp; }
            set { this.androidUseRunningApp = value; }
        }

        /// <summary>
        /// Gets or sets the process name of the Activity hosting the app. If not given, it
        /// is assumed to be the same as <see cref="AndroidActivity"/>.
        /// </summary>
        public string AndroidProcess
        {
            get { return this.androidProcess; }
            set { this.androidProcess = value; }
        }
    }
}
