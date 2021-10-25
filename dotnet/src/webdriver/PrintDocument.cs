// <copyright file="PrintDocument.cs" company="WebDriver Committers">
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
using System.IO;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a printed document in the form of a PDF document.
    /// </summary>
    public class PrintDocument : EncodedFile
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PrintDocument"/> class.
        /// </summary>
        /// <param name="base64EncodedDocument">The printed document as a Base64-encoded string.</param>
        public PrintDocument(string base64EncodedDocument) : base(base64EncodedDocument)
        {
        }

        /// <summary>
        /// Saves this <see cref="PrintDocument"/> as a PDF formatted file, overwriting the file if it already exists.
        /// </summary>
        /// <param name="fileName">The full path and file name to save the printed document to.</param>
        public override void SaveAsFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                throw new ArgumentException("The file name to be saved cannot be null or the empty string", nameof(fileName));
            }

            using (MemoryStream imageStream = new MemoryStream(this.AsByteArray))
            {
                using (FileStream fileStream = new FileStream(fileName, FileMode.Create))
                {
                    imageStream.WriteTo(fileStream);
                }
            }
        }
    }
}
