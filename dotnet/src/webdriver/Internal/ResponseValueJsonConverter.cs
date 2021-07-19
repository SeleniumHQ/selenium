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
using Newtonsoft.Json;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Converts the response to JSON
    /// </summary>
    internal class ResponseValueJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">The object to be converted</param>
        /// <returns>True if it can be converted or false if can't be</returns>
        public override bool CanConvert(Type objectType)
        {
            return true;
        }

        /// <summary>
        /// Process the reader to return an object from JSON
        /// </summary>
        /// <param name="reader">A JSON reader</param>
        /// <param name="objectType">Type of the object</param>
        /// <param name="existingValue">The existing value of the object</param>
        /// <param name="serializer">JSON Serializer</param>
        /// <returns>Object created from JSON</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return this.ProcessToken(reader);
        }

        /// <summary>
        /// Writes objects to JSON. Currently not implemented
        /// </summary>
        /// <param name="writer">JSON Writer Object</param>
        /// <param name="value">Value to be written</param>
        /// <param name="serializer">JSON Serializer </param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (serializer != null)
            {
                serializer.Serialize(writer, value);
            }
        }

        private object ProcessToken(JsonReader reader)
        {
            // Recursively processes a token. This is required for elements that next other elements.
            object processedObject = null;
            if (reader != null)
            {
                reader.DateParseHandling = DateParseHandling.None;
                if (reader.TokenType == JsonToken.StartObject)
                {
                    Dictionary<string, object> dictionaryValue = new Dictionary<string, object>();
                    while (reader.Read() && reader.TokenType != JsonToken.EndObject)
                    {
                        string elementKey = reader.Value.ToString();
                        reader.Read();
                        dictionaryValue.Add(elementKey, this.ProcessToken(reader));
                    }

                    processedObject = dictionaryValue;
                }
                else if (reader.TokenType == JsonToken.StartArray)
                {
                    List<object> arrayValue = new List<object>();
                    while (reader.Read() && reader.TokenType != JsonToken.EndArray)
                    {
                        arrayValue.Add(this.ProcessToken(reader));
                    }

                    processedObject = arrayValue.ToArray();
                }
                else
                {
                    processedObject = reader.Value;
                }
            }

            return processedObject;
        }
    }
}
