// <copyright file="WebSocketException.cs" company="WebDriver Committers">
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
using System.Security.Permissions;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides a base exception for WebSocket errors.
    /// </summary>
    [Serializable]
    public class WebSocketException : Exception
    {
        private int statusCode;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class.
        /// </summary>
        public WebSocketException()
            : base()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with a specified error message.
        /// </summary>
        /// <param name="message">The message for the exception.</param>
        public WebSocketException(string message)
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with a specified error message
        /// and a reference to the inner exception that is the cause of this exception.
        /// </summary>
        /// <param name="message">The message for the exception.</param>
        /// <param name="innerException">The inner exception that is the cause of this exception.</param>
        public WebSocketException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with a specified status code.
        /// </summary>
        /// <param name="statusCode">The status code of the exception.</param>
        public WebSocketException(int statusCode)
            : base()
        {
            this.statusCode = statusCode;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with a specified status code
        /// and error message.
        /// </summary>
        /// <param name="statusCode">The status code of the exception.</param>
        /// <param name="message">The message for the exception.</param>
        public WebSocketException(int statusCode, string message)
            : base(message)
        {
            this.statusCode = statusCode;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with a specified status code,
        /// error message, and a reference to the inner exception that is the cause of this exception.
        /// </summary>
        /// <param name="statusCode">The status code for the exception.</param>
        /// <param name="message">The message for the exception.</param>
        /// <param name="innerException">The inner exception that is the cause of this exception.</param>
        public WebSocketException(int statusCode, string message, Exception innerException)
            : base(message, innerException)
        {
            this.statusCode = statusCode;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The object that holds the serialized object data.</param>
        /// <param name="context">The contextual information about the source or destination.</param>
        protected WebSocketException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
        
        /// <summary>
        /// Gets the status code.
        /// </summary>
        public int StatusCode 
        {
            get { return this.statusCode; }
        }

        /// <summary>
        /// Sets the <see cref="SerializationInfo"/> with information about the exception.
        /// </summary>
        /// <param name="info">The <see cref="SerializationInfo"/> that holds the serialized object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="StreamingContext"/> that contains contextual information about the source or destination.</param>
        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);
        }
    }
}
