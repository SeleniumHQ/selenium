// <copyright file="CookieJsonConverter.cs" company="WebDriver Committers">
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
    /// Provides a way to convert Cookies to JSON and back
    /// </summary>
    internal class CookieJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">Type of the object</param>
        /// <returns>A value indicating if it can be converted</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType != null && objectType.IsAssignableFrom(typeof(Cookie));
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
        /// Created a cookie from the JSON string
        /// </summary>
        /// <param name="writer">The JSON writer with a string</param>
        /// <param name="value">Value of the string</param>
        /// <param name="serializer">JSON serializer instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (writer != null)
            {
                Cookie cookieValue = value as Cookie;
                if (cookieValue != null)
                {
                    writer.WriteStartObject();
                    writer.WritePropertyName("name");
                    writer.WriteValue(cookieValue.Name);
                    writer.WritePropertyName("value");
                    writer.WriteValue(cookieValue.Value);
                    writer.WritePropertyName("path");
                    if (!string.IsNullOrEmpty(cookieValue.Path))
                    {
                        writer.WriteValue(cookieValue.Path);
                    }
                    else
                    {
                        writer.WriteValue(string.Empty);
                    }

                    writer.WritePropertyName("domain");
                    if (!string.IsNullOrEmpty(cookieValue.Domain))
                    {
                        writer.WriteValue(cookieValue.Domain);
                    }
                    else
                    {
                        writer.WriteValue(string.Empty);
                    }

                    if (cookieValue.Expiry != null)
                    {
                        writer.WritePropertyName("expiry");
                        DateTime zeroDate = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                        TimeSpan span = cookieValue.Expiry.Value.ToUniversalTime().Subtract(zeroDate);
                        writer.WriteValue(Convert.ToInt64(span.TotalSeconds));
                    }

                    writer.WritePropertyName("secure");
                    writer.WriteValue(cookieValue.Secure);
                    writer.WriteEndObject();
                }
            }
        }
    }
}
