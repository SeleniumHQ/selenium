// <copyright file="DomMutationData.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization;

namespace OpenQA.Selenium;

/// <summary>
/// Provides data about the changes in the value of an attribute on an element.
/// </summary>
public class DomMutationData
{
    /// <summary>
    /// Gets the ID of the element whose value is changing.
    /// </summary>
    [JsonPropertyName("target")]
    [JsonInclude]
    public string TargetId { get; internal set; } = null!;

    /// <summary>
    /// Gets the name of the attribute that is changing.
    /// </summary>
    [JsonPropertyName("name")]
    [JsonInclude]
    public string AttributeName { get; internal set; } = null!;

    /// <summary>
    /// Gets the value to which the attribute is being changed.
    /// </summary>
    [JsonPropertyName("value")]
    [JsonInclude]
    public string AttributeValue { get; internal set; } = null!;

    /// <summary>
    /// Gets the value from which the attribute has been changed.
    /// </summary>
    [JsonPropertyName("oldValue")]
    [JsonInclude]
    public string AttributeOriginalValue { get; internal set; } = null!;

    /// <summary>
    /// Stores the element associated with the target ID, if any.
    /// </summary>
    [JsonIgnore]
    public IWebElement? Element { get; internal set; }

    /// <summary>
    /// Returns a string that represents the current object.
    /// </summary>
    /// <returns>A string that represents the current object.</returns>
    public override string ToString()
    {
        return string.Format("target: {0}, name: {1}, value: {2}, originalValue: {3}", this.TargetId, this.AttributeName, this.AttributeValue, this.AttributeOriginalValue);
    }
}
