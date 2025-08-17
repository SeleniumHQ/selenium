// <copyright file="StringConverter.cs" company="Selenium Committers">
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
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevTools.Json;

internal sealed class StringConverter : JsonConverter<string?>
{
    public override bool HandleNull => true;

    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        try
        {
            return reader.GetString();
        }
        catch (InvalidOperationException)
        {
            // Fallback to read the value as bytes instead of string.
            // System.Text.Json library throws exception when CDP remote end sends non-encoded string as binary data.
            // Using JavaScriptEncoder.UnsafeRelaxedJsonEscaping doesn't help because the string actually is byte[].
            // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Request - here "postData" property
            // is a string, which we cannot deserialize properly. This property is marked as deprecated, and new "postDataEntries"
            // is suggested for using, where most likely it is base64 encoded.

            var bytes = reader.ValueSpan;
            var sb = new StringBuilder(bytes.Length);
            foreach (byte b in bytes)
            {
                sb.Append(Convert.ToChar(b));
            }

            return sb.ToString();
        }
    }

    public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value);

    public override string? ReadAsPropertyName(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetString();
    }

    public override void WriteAsPropertyName(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WritePropertyName(value);
    }
}
