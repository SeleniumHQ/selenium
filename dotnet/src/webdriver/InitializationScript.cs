// <copyright file="InitializationScript.cs" company="Selenium Committers">
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

using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace OpenQA.Selenium;

/// <summary>
/// Represents a JavaScript script that is loaded and run on every document load.
/// </summary>
public class InitializationScript : IEquatable<InitializationScript>
{
    internal InitializationScript(string scriptId, string scriptName, string scriptSource)
    {
        ArgumentNullException.ThrowIfNull(scriptId);
        ArgumentNullException.ThrowIfNull(scriptName);
        ArgumentNullException.ThrowIfNull(scriptSource);
        this.ScriptId = scriptId;
        this.ScriptName = scriptName;
        this.ScriptSource = scriptSource;
    }

    /// <summary>
    /// Gets the internal ID of the initialization script.
    /// </summary>
    public string ScriptId { get; }

    /// <summary>
    /// Gets the friendly name of the initialization script.
    /// </summary>
    public string ScriptName { get; }

    /// <summary>
    /// Gets the JavaScript source of the initialization script.
    /// </summary>
    [StringSyntax(StringSyntaxConstants.JavaScript)]
    public string ScriptSource { get; }

    /// <summary>
    /// Indicates whether the current <see cref="InitializationScript"/> is equal to another <see cref="InitializationScript"/> of the same type.
    /// </summary>
    /// <param name="obj">An <see cref="InitializationScript"/> to compare with this <see cref="InitializationScript"/>.</param>
    /// <returns><see langword="true"/> if the current <see cref="InitializationScript"/> is equal to the other parameter; otherwise, <see langword="false"/>.</returns>
    public override bool Equals(object? obj)
    {
        return Equals(obj as InitializationScript);
    }

    /// <summary>
    /// Indicates whether the current <see cref="InitializationScript"/> is equal to another <see cref="InitializationScript"/> of the same type.
    /// </summary>
    /// <param name="other">An <see cref="InitializationScript"/> to compare with this <see cref="InitializationScript"/>.</param>
    /// <returns><see langword="true"/> if the current <see cref="InitializationScript"/> is equal to the <paramref name="other"/> parameter; otherwise, <see langword="false"/>.</returns>
    public bool Equals(InitializationScript? other)
    {
        return other is not null && this.ScriptId == other.ScriptId && this.ScriptName == other.ScriptName && this.ScriptSource == other.ScriptSource;
    }

    /// <summary>
    /// Serves as a hash function for a particular <see cref="InitializationScript"/>.
    /// </summary>
    /// <returns>A hash code for the current <see cref="InitializationScript"/>.</returns>
    public override int GetHashCode()
    {
        int result = this.ScriptId.GetHashCode();
        result = (31 * result) + this.ScriptName.GetHashCode();
        result = (31 * result) + this.ScriptSource.GetHashCode();
        return result;
    }

    /// <summary>
    /// Returns a string that represents the current object.
    /// </summary>
    /// <returns>A string that represents the current object.</returns>
    public override string ToString()
    {
        return string.Format(CultureInfo.InvariantCulture, "Initialization Script '{0}'\nInternal ID: {1}\nSource:{2}", this.ScriptName, this.ScriptId, this.ScriptSource);
    }
}
