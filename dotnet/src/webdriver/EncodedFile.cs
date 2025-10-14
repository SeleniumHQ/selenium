// <copyright file="EncodedFile.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

/// <summary>
/// Represents a file transmitted over the wire as a base64-encoded string.
/// </summary>
public abstract class EncodedFile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="EncodedFile"/> class.
    /// </summary>
    /// <param name="base64EncodedFile">The file as a Base64-encoded string.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="base64EncodedFile"/> is <see langword="null"/>.</exception>
    /// <exception cref="FormatException">
    /// <para>The length of <paramref name="base64EncodedFile"/>, ignoring white-space characters, is not zero or a multiple of 4.</para>
    /// <para>-or-</para>
    /// <para>The format of <paramref name="base64EncodedFile"/> is invalid. <paramref name="base64EncodedFile"/> contains a non-base-64 character,
    /// more than two padding characters, or a non-white space-character among the padding characters.</para>
    /// </exception>
    protected EncodedFile(string base64EncodedFile)
    {
        this.AsBase64EncodedString = base64EncodedFile ?? throw new ArgumentNullException(nameof(base64EncodedFile));
        this.AsByteArray = Convert.FromBase64String(base64EncodedFile);
    }

    /// <summary>
    /// Gets the value of the encoded file as a Base64-encoded string.
    /// </summary>
    public string AsBase64EncodedString { get; }

    /// <summary>
    /// Gets the value of the encoded file as an array of bytes.
    /// </summary>
    public byte[] AsByteArray { get; }

    /// <summary>
    /// Saves the file, overwriting it if it already exists.
    /// </summary>
    /// <param name="fileName">The full path and file name to save the file to.</param>
    public abstract void SaveAsFile(string fileName);

    /// <summary>
    /// Returns a <see cref="string">String</see> that represents the current <see cref="object">Object</see>.
    /// </summary>
    /// <returns>A <see cref="string">String</see> that represents the current <see cref="object">Object</see>.</returns>
    public override string ToString() => this.AsBase64EncodedString;
}
