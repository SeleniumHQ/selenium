// <copyright file="DesiredCapabilitiesJsonConverter.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to convert DesiredCapabilities objects to JSON and back
    /// </summary>
    internal class DesiredCapabilitiesJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">Type of the object</param>
        /// <returns>A value indicating if it can be converted</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType != null && objectType.IsAssignableFrom(typeof(DesiredCapabilities));
        }

        /// <summary>
        /// Get the capabilities from the JSON reader
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="existingValue">The existing value of the object</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Platform from JSON reader</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            object deserialized = null;
            if (reader != null && serializer != null)
            {
                deserialized = serializer.Deserialize(reader);
            }

            return deserialized;
        }

        /// <summary>
        /// Creates a JSON string representing the DesiredCapabilities object
        /// </summary>
        /// <param name="writer">The JSON writer with a string</param>
        /// <param name="value">Value of the string</param>
        /// <param name="serializer">JSON serializer instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (writer != null)
            {
                DesiredCapabilities capabilities = value as DesiredCapabilities;
                if (capabilities != null)
                {
                    writer.WriteStartObject();
                    foreach (string name in capabilities.Capabilities.Keys)
                    {
                        writer.WritePropertyName(name);
                        writer.WriteRawValue(JsonConvert.SerializeObject(capabilities.Capabilities[name], new PlatformJsonConverter(), new ProxyJsonConverter()));
                    }

                    writer.WriteEndObject();
                }
            }
        }
    }
}
