// <copyright file="InputSourceActionsConverter.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class InputSourceActionsConverter : JsonConverter<SourceActions>
{
    public override SourceActions Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, SourceActions value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();

        writer.WriteString("id", value.Id);

        switch (value)
        {
            case KeyActions keys:
                writer.WriteString("type", "key");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, keys.Actions.Select(a => a as IKeySourceAction), options.GetTypeInfo<IEnumerable<IKeySourceAction?>>());

                break;
            case PointerActions pointers:
                writer.WriteString("type", "pointer");
                if (pointers.Options is not null)
                {
                    writer.WritePropertyName("parameters");
                    JsonSerializer.Serialize(writer, pointers.Options, options.GetTypeInfo(typeof(PointerParameters)));
                }

                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, pointers.Actions.Select(a => a as IPointerSourceAction), options.GetTypeInfo<IEnumerable<IPointerSourceAction?>>());

                break;
            case WheelActions wheels:
                writer.WriteString("type", "wheel");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, wheels.Actions.Select(a => a as IWheelSourceAction), options.GetTypeInfo<IEnumerable<IWheelSourceAction?>>());

                break;
            case NoneActions none:
                writer.WriteString("type", "none");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, none.Actions.Select(a => a as INoneSourceAction), options.GetTypeInfo<IEnumerable<INoneSourceAction?>>());

                break;
        }

        writer.WriteEndObject();
    }
}

