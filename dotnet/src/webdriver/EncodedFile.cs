// <copyright file="EncodedFile.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a file transmitted over the wire as a base64-encoded string.
    /// </summary>
    public abstract class EncodedFile
    {
        private string base64Encoded = string.Empty;
        private byte[] byteArray;

        /// <summary>
        /// Initializes a new instance of the <see cref="EncodedFile"/> class.
        /// </summary>
        /// <param name="base64EncodedFile">The file as a Base64-encoded string.</param>
        protected EncodedFile(string base64EncodedFile)
        {
            this.base64Encoded = base64EncodedFile;
            this.byteArray = Convert.FromBase64String(this.base64Encoded);
        }

        /// <summary>
        /// Gets the value of the encoded file as a Base64-encoded string.
        /// </summary>
        public string AsBase64EncodedString
        {
            get { return this.base64Encoded; }
        }

        /// <summary>
        /// Gets the value of the encoded file as an array of bytes.
        /// </summary>
        public byte[] AsByteArray
        {
            get { return this.byteArray; }
        }

        /// <summary>
        /// Saves the file, overwriting it if it already exists.
        /// </summary>
        /// <param name="fileName">The full path and file name to save the file to.</param>
        public abstract void SaveAsFile(string fileName);

        /// <summary>
        /// Returns a <see cref="string">String</see> that represents the current <see cref="object">Object</see>.
        /// </summary>
        /// <returns>A <see cref="string">String</see> that represents the current <see cref="object">Object</see>.</returns>
        public override string ToString()
        {
            return this.base64Encoded;
        }
    }
}
