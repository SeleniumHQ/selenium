// <copyright file="HttpResponseContent.cs" company="WebDriver Committers">
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

using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the content of an HTTP response.
    /// </summary>
    public class HttpResponseContent
    {
        private readonly byte[] content;

        /// <summary>
        /// Initializes a new instance of the <see cref="HttpResponseContent"/> class.
        /// </summary>
        /// <param name="content">The byte array representing the content of the response.</param>
        public HttpResponseContent(byte[] content)
        {
            this.content = content;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="HttpResponseContent"/> class.
        /// </summary>
        /// <param name="content">The UTF8 encoded string representing the content of the response.</param>
        public HttpResponseContent(string content)
        {
            this.content = Encoding.UTF8.GetBytes(content);
        }

        /// <summary>
        /// Reads the content of the response as a UTF8 encoded string.
        /// </summary>
        /// <returns>The content of the response as a string.</returns>
        public string ReadAsString()
        {
            return Encoding.UTF8.GetString(content);
        }

        /// <summary>
        /// Reads the content of the response as a byte array.
        /// </summary>
        /// <returns>The content of the response as a byte array.</returns>
        public byte[] ReadAsByteArray()
        {
            return content;
        }
    }
}
