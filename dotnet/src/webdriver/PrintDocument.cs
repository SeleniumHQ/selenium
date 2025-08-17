// <copyright file="PrintDocument.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.IO;

namespace OpenQA.Selenium;

/// <summary>
/// Represents a printed document in the form of a PDF document.
/// </summary>
public class PrintDocument : EncodedFile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="PrintDocument"/> class.
    /// </summary>
    /// <param name="base64EncodedDocument">The printed document as a Base64-encoded string.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="base64EncodedDocument"/> is <see langword="null"/>.</exception>
    /// <exception cref="FormatException">
    /// <para>The length of <paramref name="base64EncodedDocument"/>, ignoring white-space characters, is not zero or a multiple of 4.</para>
    /// <para>-or-</para>
    /// <para>The format of <paramref name="base64EncodedDocument"/> is invalid. <paramref name="base64EncodedDocument"/> contains a non-base-64 character,
    /// more than two padding characters, or a non-white space-character among the padding characters.</para>
    /// </exception>
    public PrintDocument(string base64EncodedDocument) : base(base64EncodedDocument)
    {
    }

    /// <summary>
    /// Saves this <see cref="PrintDocument"/> as a PDF formatted file, overwriting the file if it already exists.
    /// </summary>
    /// <param name="fileName">The full path and file name to save the printed document to.</param>
    /// <exception cref="ArgumentException">
    /// <para>If <paramref name="fileName"/> is <see langword="null"/> or whitespace.</para>
    /// <para>-or-</para>
    /// <para><paramref name="fileName"/> refers to a non-file device, such as "con:", "com1:", "lpt1:", etc. in an NTFS environment.</para>
    /// </exception>
    /// <exception cref="NotSupportedException"><paramref name="fileName"/> refers to a non-file device, such as "con:", "com1:", "lpt1:", etc. in a non-NTFS environment.</exception>
    /// <exception cref="DirectoryNotFoundException">The specified path is invalid, such as being on an unmapped drive.</exception>
    /// <exception cref="PathTooLongException">The specified path, file name, or both exceed the system-defined maximum length.</exception>
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
