// <copyright file="NoSuchElementException.cs" company="WebDriver Committers">
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
    /// The exception that is thrown when an element is not found.
    /// </summary>
    [Serializable]
    public class NoSuchElementException : NotFoundException
    {

        /// <summary>
        /// Link to the documentation for this error
        /// </summary>
        private static string supportUrl = baseSupportUrl + "#no-such-element-exception";

        /// <summary>
        /// Initializes a new instance of the <see cref="NoSuchElementException"/> class.
        /// </summary>
        public NoSuchElementException()
            : base(GetMessage(""))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="NoSuchElementException"/> class with
        /// a specified error message.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public NoSuchElementException(string message)
            : base(GetMessage(message))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="NoSuchElementException"/> class with
        /// a specified error message and a reference to the inner exception that is the
        /// cause of this exception.
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception.</param>
        /// <param name="innerException">The exception that is the cause of the current exception,
        /// or <see langword="null"/> if no inner exception is specified.</param>
        public NoSuchElementException(string message, Exception innerException)
            : base(GetMessage(message), innerException)
        {
        }

        /// <summary>
        /// Add information about obtaining additional support from documentation to this exception.
        /// </summary>
        /// <param name="message">The original message for exception</param>
        /// <returns>The final message for exception</returns>
        protected static string GetMessage(string message)
        {
            return message + "; " + supportMsg + supportUrl;
        }
    }
}
