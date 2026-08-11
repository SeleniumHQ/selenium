// <copyright file="AdditionalData.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Nodes;

namespace OpenQA.Selenium.BiDi;

public readonly struct AdditionalData
{
    private static readonly JsonElement s_emptyObject = JsonDocument.Parse("{}").RootElement;

    private readonly JsonElement _data;

    public static readonly AdditionalData Empty = default;

    public AdditionalData(JsonObject json)
    {
        _data = JsonSerializer.SerializeToElement(json);
    }

    public AdditionalData([StringSyntax(StringSyntaxAttribute.Json)] string json)
    {
        using var doc = JsonDocument.Parse(json);

        if (doc.RootElement.ValueKind != JsonValueKind.Object)
        {
            throw new ArgumentException("Additional data must be a JSON object.", nameof(json));
        }

        _data = doc.RootElement.Clone();
    }

    internal AdditionalData(JsonElement element)
    {
        _data = element;
    }

    internal static AdditionalData FromDictionary(Dictionary<string, JsonElement> dict)
    {
        var stream = new MemoryStream();
        using var writer = new Utf8JsonWriter(stream);
        writer.WriteStartObject();
        foreach (var kvp in dict)
        {
            writer.WritePropertyName(kvp.Key);
            kvp.Value.WriteTo(writer);
        }
        writer.WriteEndObject();
        writer.Flush();
        stream.Position = 0;
        using var doc = JsonDocument.Parse(stream);
        return new AdditionalData(doc.RootElement.Clone());
    }

    public static implicit operator AdditionalData(JsonObject json) => new(json);

    public static implicit operator AdditionalData([StringSyntax(StringSyntaxAttribute.Json)] string json) => new(json);

    public bool IsEmpty => _data.ValueKind != JsonValueKind.Object;

    public JsonElement this[string key] => IsEmpty ? throw new KeyNotFoundException(key) : _data.GetProperty(key);

    public bool TryGetValue(string key, out JsonElement value)
    {
        if (IsEmpty)
        {
            value = default;
            return false;
        }
        return _data.TryGetProperty(key, out value);
    }

    public int Count => IsEmpty ? 0 : _data.EnumerateObject().Count();

    public JsonElement.ObjectEnumerator GetEnumerator() =>
        IsEmpty ? s_emptyObject.EnumerateObject() : _data.EnumerateObject();
}
