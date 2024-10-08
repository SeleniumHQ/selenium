// <copyright file="WebDriverException.cs" company="WebDriver Committers">
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
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents exceptions that are thrown when an error occurs during actions.
    /// </summary>
    [Serializable]
    public class WebDriverException : Exception
    {
        /// <summary>
        /// Intro comment for pointing to documentation
        /// </summary>
        protected static string supportMsg = "For documentation on this error, please visit: ";

        /// <summary>
        /// Location of errors in documentation
        /// </summary>
        protected static string baseSupportUrl = "https://www.selenium.dev/documentation/webdriver/troubleshooting/errors";

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverException"/> class.
        /// </summary>
        public WebDriverException()
            : base()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverException"/> class with
        /// a specified error message.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public WebDriverException(string message)
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverException"/> class with
        /// a specified error message and a reference to the inner exception that is the
        /// cause of this exception.
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception.</param>
        /// <param name="innerException">The exception that is the cause of the current exception,
        /// or <see langword="null"/> if no inner exception is specified.</param>
        public WebDriverException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
