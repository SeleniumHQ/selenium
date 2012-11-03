// <copyright file="ProxyJsonConverter.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to convert a <see cref="Proxy"/> array to JSON
    /// </summary>
    internal class ProxyJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">Type of the object</param>
        /// <returns>A value indicating if it can be converted</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType != null && objectType.IsAssignableFrom(typeof(Proxy));
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
            // This JsonConverter is only used for one-way conversions of Proxy objects to JSON objects.
            return null;
        }

        /// <summary>
        /// Create a JSON string representation of the Proxy
        /// </summary>
        /// <param name="writer">The JSON writer with a string</param>
        /// <param name="value">Value of the string</param>
        /// <param name="serializer">JSON serializer instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (writer != null)
            {
                Proxy proxyValue = value as Proxy;
                if (proxyValue != null)
                {
                    writer.WriteStartObject();
                    writer.WritePropertyName("proxyType");
                    writer.WriteValue(proxyValue.Kind.ToString("G").ToUpper(CultureInfo.InvariantCulture));

                    if (!string.IsNullOrEmpty(proxyValue.FtpProxy))
                    {
                        writer.WritePropertyName("ftpProxy");
                        writer.WriteValue(proxyValue.FtpProxy);
                    }

                    if (!string.IsNullOrEmpty(proxyValue.HttpProxy))
                    {
                        writer.WritePropertyName("httpProxy");
                        writer.WriteValue(proxyValue.HttpProxy);
                    }

                    if (!string.IsNullOrEmpty(proxyValue.NoProxy))
                    {
                        writer.WritePropertyName("noProxy");
                        writer.WriteValue(proxyValue.NoProxy);
                    }

                    if (!string.IsNullOrEmpty(proxyValue.ProxyAutoConfigUrl))
                    {
                        writer.WritePropertyName("proxyAutoconfigUrl");
                        writer.WriteValue(proxyValue.ProxyAutoConfigUrl);
                    }

                    if (!string.IsNullOrEmpty(proxyValue.ProxyAutoConfigUrl))
                    {
                        writer.WritePropertyName("proxyAutoconfigUrl");
                        writer.WriteValue(proxyValue.ProxyAutoConfigUrl);
                    }

                    if (!string.IsNullOrEmpty(proxyValue.SslProxy))
                    {
                        writer.WritePropertyName("sslProxy");
                        writer.WriteValue(proxyValue.SslProxy);
                    }

                    writer.WritePropertyName("autodetect");
                    writer.WriteValue(proxyValue.IsAutoDetect);
                    writer.WriteEndObject();
                }
            }
        }
    }
}
