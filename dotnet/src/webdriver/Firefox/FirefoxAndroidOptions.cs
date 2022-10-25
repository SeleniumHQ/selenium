// <copyright file="FirefoxAndroidOptions.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Generates the capabilities for automating Firefox applications on Android
    /// </summary>
    public class FirefoxAndroidOptions : AndroidOptions
    {
        private List<string> androidIntentArguments = new List<string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxAndroidOptions"/> class.
        /// </summary>
        /// <param name="androidPackage"></param>
        public FirefoxAndroidOptions(string androidPackage) : base(androidPackage)
        {
        }

        /// <summary>
        /// Gets a read-only list of the intent arguments set for this set of options.
        /// </summary>
        public ReadOnlyCollection<string> AndroidIntentArguments
        {
            get { return this.androidIntentArguments.AsReadOnly(); }
        }

        /// <summary>
        /// Argument to launch the intent with. The given intent arguments are appended to the "am start" command. 
        /// </summary>
        /// <param name="arguments">The argument to add.</param>
        public void AddIntentArgument(string argument)
        {
            this.AddIntentArguments(argument);
        }

        /// <summary>
        /// Arguments to launch the intent with. The given intent arguments are appended to the "am start" command. 
        /// </summary>
        /// <param name="arguments">The arguments to add.</param>
        public void AddIntentArguments(params string[] arguments)
        {
            this.androidIntentArguments.AddRange(arguments);
        }
    }
}
