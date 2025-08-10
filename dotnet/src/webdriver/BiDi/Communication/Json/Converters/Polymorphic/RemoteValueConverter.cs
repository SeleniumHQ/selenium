// <copyright file="RemoteValueConverter.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class RemoteValueConverter : JsonConverter<RemoteValue>
{
    public override RemoteValue? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return new StringRemoteValue(reader.GetString()!);
        }

        return reader.GetDiscriminator("type") switch
        {
            "number" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NumberRemoteValue>()),
            "boolean" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<BooleanRemoteValue>()),
            "bigint" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<BigIntRemoteValue>()),
            "string" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<StringRemoteValue>()),
            "null" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NullRemoteValue>()),
            "undefined" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<UndefinedRemoteValue>()),
            "symbol" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<SymbolRemoteValue>()),
            "array" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ArrayRemoteValue>()),
            "object" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ObjectRemoteValue>()),
            "function" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<FunctionRemoteValue>()),
            "regexp" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<RegExpRemoteValue>()),
            "date" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<DateRemoteValue>()),
            "map" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<MapRemoteValue>()),
            "set" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<SetRemoteValue>()),
            "weakmap" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WeakMapRemoteValue>()),
            "weakset" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WeakSetRemoteValue>()),
            "generator" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<GeneratorRemoteValue>()),
            "error" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ErrorRemoteValue>()),
            "proxy" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ProxyRemoteValue>()),
            "promise" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<PromiseRemoteValue>()),
            "typedarray" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<TypedArrayRemoteValue>()),
            "arraybuffer" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ArrayBufferRemoteValue>()),
            "nodelist" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NodeListRemoteValue>()),
            "htmlcollection" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<HtmlCollectionRemoteValue>()),
            "node" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NodeRemoteValue>()),
            "window" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WindowProxyRemoteValue>()),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, RemoteValue value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
