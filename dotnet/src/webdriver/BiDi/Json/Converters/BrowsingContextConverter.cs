// <copyright file="BrowsingContextConverter.cs" company="Selenium Committers">
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

using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Json.Converters;

internal class BrowsingContextConverter(IBiDi bidi) : JsonConverter<BrowsingContext.BrowsingContext>
{
    private static readonly ConditionalWeakTable<IBiDi, ConcurrentDictionary<string, BrowsingContext.BrowsingContext>> s_cache = new();

    public override BrowsingContext.BrowsingContext? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        var sessionCache = s_cache.GetValue(bidi, _ => new ConcurrentDictionary<string, BrowsingContext.BrowsingContext>());

        return sessionCache.GetOrAdd(id!, key => new BrowsingContext.BrowsingContext(bidi, key));
    }

    public override void Write(Utf8JsonWriter writer, BrowsingContext.BrowsingContext value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
