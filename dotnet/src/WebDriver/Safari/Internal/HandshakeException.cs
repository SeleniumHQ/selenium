// <copyright file="HandshakeException.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an exception for handshake errors in the protocol connection.
    /// </summary>
    [Serializable]
    public class HandshakeException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HandshakeException"/> class.
        /// </summary>
        public HandshakeException()
            : base()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="HandshakeException"/> class with a specified error message.
        /// </summary>
        /// <param name="message">The message for the exception.</param>
        public HandshakeException(string message)
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="HandshakeException"/> class with a specified error message
        /// and a reference to the inner exception that is the cause of this exception.
        /// </summary>
        /// <param name="message">The message for the exception.</param>
        /// <param name="innerException">The inner exception that is the cause of this exception.</param>
        public HandshakeException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="HandshakeException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The object that holds the serialized object data.</param>
        /// <param name="context">The contextual information about the source or destination.</param>
        protected HandshakeException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
