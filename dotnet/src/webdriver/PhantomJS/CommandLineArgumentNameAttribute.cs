// <copyright file="CommandLineArgumentNameAttribute.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Allows the user to specify the name of an argument to be used on the command line for PhantomJS.
    /// </summary>
    internal sealed class CommandLineArgumentNameAttribute : Attribute
    {
        private string argumentName = string.Empty;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommandLineArgumentNameAttribute"/> class.
        /// </summary>
        /// <param name="argumentName">The name of the argument to be used in the PhantomJS command line.</param>
        public CommandLineArgumentNameAttribute(string argumentName)
        {
            this.argumentName = argumentName;
        }

        /// <summary>
        /// Gets the name of the argument to be used in the PhantomJS command line.
        /// </summary>
        public string Name
        {
            get { return this.argumentName; }
        }
    }
}
