// <copyright file="JsonEnumMemberConverter.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevTools.Json;

internal sealed class JsonEnumMemberConverter<[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields)] TEnum> : JsonConverter<TEnum>
    where TEnum : struct, Enum
{
    private readonly Dictionary<TEnum, string> _enumToString = new Dictionary<TEnum, string>();
    private readonly Dictionary<string, TEnum> _stringToEnum = new Dictionary<string, TEnum>();

    public JsonEnumMemberConverter()
    {
        var type = typeof(TEnum);
#if NET8_0_OR_GREATER
        TEnum[] values = Enum.GetValues<TEnum>();
#else
        Array values = Enum.GetValues(type);
#endif
        foreach (var value in values)
        {
            var enumMember = type.GetField(value.ToString())!;
            var attr = enumMember.GetCustomAttributes(typeof(EnumMemberAttribute), false)
              .Cast<EnumMemberAttribute>()
              .FirstOrDefault();

            _stringToEnum.Add(value.ToString(), (TEnum)value);

            if (attr?.Value != null)
            {
                _enumToString[(TEnum)value] = attr.Value;
                _stringToEnum[attr.Value] = (TEnum)value;
            }
            else
            {
                _enumToString.Add((TEnum)value, value.ToString());
            }
        }
    }

    public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var stringValue = reader.GetString() ?? throw new JsonException("Could not read an enum string from \"null\"");

        if (_stringToEnum.TryGetValue(stringValue, out var enumValue))
        {
            return enumValue;
        }

        return default;
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(_enumToString[value]);
    }
}
