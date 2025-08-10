// <copyright file="InputOriginConverter.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Input;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

[UnconditionalSuppressMessage("Trimming", "IL2026", Justification = "Json serializer options should have AOT-safe type resolution")]
[UnconditionalSuppressMessage("AOT", "IL3050", Justification = "Json serializer options should have AOT-safe type resolution")]
internal class InputOriginConverter : JsonConverter<Origin>
{
    public override Origin Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, Origin value, JsonSerializerOptions options)
    {
        if (value is ViewportOrigin)
        {
            writer.WriteStringValue("viewport");
        }
        else if (value is PointerOrigin)
        {
            writer.WriteStringValue("pointer");
        }
        else if (value is ElementOrigin element)
        {
            writer.WriteStartObject();
            writer.WriteString("type", "element");
            writer.WritePropertyName("element");
            JsonSerializer.Serialize(writer, element.Element, options);
            writer.WriteEndObject();
        }
    }
}
