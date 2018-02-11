// <copyright file="LoadableComponentException.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// This exception is thrown by <see cref="LoadableComponent{T}"/> to indicate that
    /// the component was not successfully loaded.
    /// </summary>
    [Serializable]
    public class LoadableComponentException : WebDriverException
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LoadableComponentException"/> class.
        /// </summary>
        public LoadableComponentException()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LoadableComponentException"/> class with
        /// a specified error message.
        /// </summary>
        /// <param name="message">The message of the exception</param>
        public LoadableComponentException(string message)
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LoadableComponentException"/> class with
        /// a specified error message and a reference to the inner exception that is the
        /// cause of this exception.
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception.</param>
        /// <param name="innerException">The exception that is the cause of the current exception,
        /// or <see langword="null"/> if no inner exception is specified.</param>
        public LoadableComponentException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LoadableComponentException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The <see cref="SerializationInfo"/> that holds the serialized
        /// object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="StreamingContext"/> that contains contextual
        /// information about the source or destination.</param>
        protected LoadableComponentException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
