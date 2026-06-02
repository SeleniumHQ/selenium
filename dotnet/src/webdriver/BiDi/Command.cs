// <copyright file="Command.cs" company="Selenium Committers">
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

using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace OpenQA.Selenium.BiDi;

public readonly record struct Command<TParameters, TResult>(
    string Method,
    JsonTypeInfo<TParameters> ParamsTypeInfo,
    JsonTypeInfo<TResult> ResultTypeInfo)
    where TParameters : Parameters
    where TResult : EmptyResult;

public record Parameters
{
    public static Parameters Empty { get; } = new Parameters();

    [JsonExtensionData]
    [EditorBrowsable(EditorBrowsableState.Never)]
    public Dictionary<string, JsonElement>? RawAdditionalData { get; set; }

    [JsonIgnore]
    public ImmutableDictionary<string, JsonElement> AdditionalData
    {
        get => RawAdditionalData?.ToImmutableDictionary() ?? ImmutableDictionary<string, JsonElement>.Empty;
        init => RawAdditionalData = value.IsEmpty ? null : new(value!);
    }
}

public abstract record CommandOptions
{
    public TimeSpan? Timeout { get; init; }

    public ImmutableDictionary<string, JsonElement> AdditionalData { get; init; }
        = ImmutableDictionary<string, JsonElement>.Empty;

    public ImmutableDictionary<string, JsonElement> AdditionalMessageData { get; init; }
        = ImmutableDictionary<string, JsonElement>.Empty;
}

public abstract record EmptyResult
{
    [JsonExtensionData]
    [EditorBrowsable(EditorBrowsableState.Never)]
    public Dictionary<string, JsonElement>? RawAdditionalData { get; set; }

    [JsonIgnore]
    public ImmutableDictionary<string, JsonElement> AdditionalData
    {
        get => RawAdditionalData?.ToImmutableDictionary() ?? ImmutableDictionary<string, JsonElement>.Empty;
        init => RawAdditionalData = value.IsEmpty ? null : new(value!);
    }
}
