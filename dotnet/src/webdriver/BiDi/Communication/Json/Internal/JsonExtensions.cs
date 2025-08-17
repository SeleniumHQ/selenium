// <copyright file="JsonExtensions.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

namespace OpenQA.Selenium.BiDi.Communication.Json.Internal;

internal static class JsonExtensions
{
    public static string GetDiscriminator(this ref Utf8JsonReader reader, string name)
    {
        Utf8JsonReader readerClone = reader;

        if (readerClone.TokenType != JsonTokenType.StartObject)
            throw new JsonException($"Cannot determine the discriminator of {readerClone.TokenType} token type while supported is {JsonTokenType.StartObject} only.");

        string? discriminator = null;

        readerClone.Read();
        while (readerClone.TokenType == JsonTokenType.PropertyName)
        {
            string? propertyName = readerClone.GetString();
            readerClone.Read();

            if (propertyName == name)
            {
                discriminator = readerClone.GetString();

                break;
            }

            readerClone.Skip();
            readerClone.Read();
        }

        return discriminator ?? throw new JsonException($"Couldn't determine '{name}' discriminator.");
    }

    public static JsonTypeInfo<T> GetTypeInfo<T>(this JsonSerializerOptions options)
    {
        return (JsonTypeInfo<T>)options.GetTypeInfo(typeof(T));
    }
}
