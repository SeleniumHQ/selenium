// <copyright file="GetRealmsResultConverter.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Communication.Json.Internal;
using OpenQA.Selenium.BiDi.Script;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class GetRealmsResultConverter : JsonConverter<GetRealmsResult>
{
    public override GetRealmsResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        var realms = doc.RootElement.GetProperty("realms").Deserialize(options.GetTypeInfo<IReadOnlyList<RealmInfo>>());

        return new GetRealmsResult(realms!);
    }

    public override void Write(Utf8JsonWriter writer, GetRealmsResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
