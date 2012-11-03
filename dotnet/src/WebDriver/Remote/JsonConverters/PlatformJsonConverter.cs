// <copyright file="PlatformJsonConverter.cs" company="WebDriver Committers">
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
using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism to get the platform from JSON and write the platform 
    /// </summary>
    internal class PlatformJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the type can be converted
        /// </summary>
        /// <param name="objectType">Object type to be converted</param>
        /// <returns>A value indicating if it can be converted</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType != null && objectType.IsAssignableFrom(typeof(Platform));
        }

        /// <summary>
        /// Get the platform from the JSON reader
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="existingValue">The existing value of the object</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Platform from JSON reader</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            Platform platformValue = null;
            if (reader != null)
            {
                if (reader.TokenType == JsonToken.String)
                {
                    PlatformType platformTypeValue = (PlatformType)Enum.Parse(objectType, reader.Value.ToString(), true);
                    platformValue = new Platform(platformTypeValue);
                }
            }

            return platformValue;
        }

        /// <summary>
        /// Writes the platform to JSON
        /// </summary>
        /// <param name="writer">JSON Writer instance</param>
        /// <param name="value">the platform</param>
        /// <param name="serializer">JSON Serializer Instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (writer != null)
            {
                Platform platformValue = value as Platform;
                if (platformValue != null)
                {
                    writer.WriteValue(platformValue.PlatformType.ToString("G").ToUpper(CultureInfo.InvariantCulture));
                }
            }
        }
    }
}
