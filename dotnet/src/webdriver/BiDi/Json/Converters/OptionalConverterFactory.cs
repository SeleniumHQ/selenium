// <copyright file="OptionalConverterFactory.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace OpenQA.Selenium.BiDi.Json.Converters;

internal sealed class OptionalConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert) => typeToConvert.IsGenericType && typeToConvert.GetGenericTypeDefinition() == typeof(Optional<>);

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converter = (JsonConverter?)Activator.CreateInstance(typeof(OptionalConverter<>).MakeGenericType(typeToConvert.GenericTypeArguments[0]));

        return converter;
    }

    internal sealed class OptionalConverter<T> : JsonConverter<Optional<T>>
    {
        public override bool HandleNull => true;

        public override Optional<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var converter = (JsonTypeInfo<T>)options.GetTypeInfo(typeof(T));

            T? value = JsonSerializer.Deserialize<T>(ref reader, converter);
            return new Optional<T>(value);
        }

        public override void Write(Utf8JsonWriter writer, Optional<T> value, JsonSerializerOptions options)
        {
            if (value.TryGetValue(out var optionalValue))
            {
                var converter = (JsonTypeInfo<T?>)options.GetTypeInfo(typeof(T?));

                JsonSerializer.Serialize(writer, optionalValue, converter);
            }
            else
            {
                throw new JsonException("This property should be annotated with [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]");
            }
        }
    }
}

