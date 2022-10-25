// <copyright file="AndroidOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Provides a base class for options for browsers to be automated on Android.
    /// </summary>
    public class AndroidOptions
    {
        private string androidPackage;
        private string androidDeviceSerial;
        private string androidActivity;

        /// <summary>
        /// Initializes a new instance of the <see cref="AndroidOptions"/> class.
        /// </summary>
        /// <param name="androidPackage"></param>
        protected AndroidOptions(string androidPackage)
        {
            if (string.IsNullOrEmpty(androidPackage))
            {
                throw new ArgumentException("The Android package cannot be null or the empty string", nameof(androidPackage));
            }

            this.androidPackage = androidPackage;
        }

        /// <summary>
        /// The package name of the application to automate.
        /// </summary>
        public string AndroidPackage
        {
            get { return this.androidPackage; }
        }

        /// <summary>
        /// The serial number of the device on which to launch the application.
        /// </summary>
        public string AndroidDeviceSerial
        {
            get { return this.androidDeviceSerial; }
            set { this.androidDeviceSerial = value; }
        }

        /// <summary>
        /// Gets or sets the name of the Activity hosting the app.
        /// </summary>
        public string AndroidActivity
        {
            get { return this.androidActivity; }
            set { this.androidActivity = value; }
        }
    }
}
