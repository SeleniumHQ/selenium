// <copyright file="ResponseValueJsonConverter.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Converts the response to JSON
    /// </summary>
    internal class ResponseValueJsonConverter : JsonConverter<object>
    {
        public override object Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return this.ProcessToken(ref reader, options);
        }

        public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options)
        {
            JsonSerializer.Serialize(writer, value, options);
        }

        private object ProcessToken(ref Utf8JsonReader reader, JsonSerializerOptions options)
        {
            // Recursively processes a token. This is required for elements that next other elements.
            object processedObject = null;

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                Dictionary<string, object> dictionaryValue = new Dictionary<string, object>();
                while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
                {
                    string elementKey = reader.GetString();
                    reader.Read();
                    dictionaryValue.Add(elementKey, this.ProcessToken(ref reader, options));
                }

                processedObject = dictionaryValue;
            }
            else if (reader.TokenType == JsonTokenType.StartArray)
            {
                List<object> arrayValue = new List<object>();
                while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                {
                    arrayValue.Add(this.ProcessToken(ref reader, options));
                }

                processedObject = arrayValue.ToArray();
            }
            else if (reader.TokenType == JsonTokenType.Null)
            {
                processedObject = null;
            }
            else if (reader.TokenType == JsonTokenType.False)
            {
                processedObject = false;
            }
            else if (reader.TokenType == JsonTokenType.True)
            {
                processedObject = true;
            }
            else if (reader.TokenType == JsonTokenType.String)
            {
                processedObject = reader.GetString();
            }
            else if (reader.TokenType == JsonTokenType.Number)
            {
                if (reader.TryGetInt64(out long longValue))
                {
                    processedObject = longValue;
                }
                else if (reader.TryGetDouble(out double doubleValue))
                {
                    processedObject = doubleValue;
                }
                else
                {
                    throw new JsonException($"Unrecognized '{JsonElement.ParseValue(ref reader)}' token as a number value.");
                }
            }
            else
            {
                throw new JsonException($"Unrecognized '{reader.TokenType}' token type while parsing command response.");
            }

            return processedObject;
        }
    }
}
