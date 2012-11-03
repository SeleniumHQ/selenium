// <copyright file="CharArrayJsonConverter.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to convert a Char array to JSON
    /// </summary>
    internal class CharArrayJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">Type of the object to see if can be converted</param>
        /// <returns>True if can be converted else false</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType != null && objectType.IsAssignableFrom(typeof(char[]));
        }

        /// <summary>
        /// Writes the Object to JSON
        /// </summary>
        /// <param name="writer">A JSON Writer object</param>
        /// <param name="value">Object to be converted</param>
        /// <param name="serializer">JSON Serializer object instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (writer != null)
            {
                // We need a custom writer for char arrays, such as are used with SendKeys.
                // JSON.NET does not properly handle converting unicode characters to \uxxxx.
                writer.WriteStartArray();
                char[] arrayObject = value as char[];
                if (arrayObject != null)
                {
                    foreach (char currentChar in arrayObject)
                    {
                        int codepoint = Convert.ToInt32(currentChar);
                        if ((codepoint >= 32) && (codepoint <= 126))
                        {
                            writer.WriteValue(currentChar);
                        }
                        else
                        {
                            string charRepresentation = "\\u" + Convert.ToString(codepoint, 16).PadLeft(4, '0');
                            writer.WriteRawValue("\"" + charRepresentation + "\"");
                        }
                    }
                }

                writer.WriteEndArray();
            }
        }

        /// <summary>
        /// Method not implemented
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="existingValue">Existing Value to be read</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Object from JSON</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }
}
