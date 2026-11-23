// <copyright file="EventArgs.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi;

public abstract record EventArgs
{
    [JsonIgnore]
    public IBiDi BiDi { get; internal set; } = null!;

    [JsonExtensionData]
    [EditorBrowsable(EditorBrowsableState.Never)]
    // IMPORTANT NOTE: Reasons for this property being public:
    // - The setter is not internal because the deserializer needs to be able to set this property when deserializing a command result
    // - The property is public to make external serializers see it so that they can deserialize additional data when deserializing a command result
    // - EditorBrowsableState.Never hides this property from IntelliSense to avoid confusion for users; it is technically a public property
    public Dictionary<string, JsonElement>? RawAdditionalData { get; set; }

    [JsonIgnore]
    public AdditionalData AdditionalData
        => RawAdditionalData is null ? AdditionalData.Empty : AdditionalData.FromDictionary(RawAdditionalData);

    [JsonIgnore]
    public AdditionalData AdditionalMessageData { get; internal set; }
}
