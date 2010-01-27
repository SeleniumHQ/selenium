using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Converter used to convert <see cref="Cookie">Cookies</see> to the proper JSON format.
    /// </summary>
    internal class CookieJsonConverter : JsonConverter
    {
        /// <summary>
        /// Determines whether this instance can convert the specified object type.
        /// </summary>
        /// <param name="objectType">Type of the object.</param>
        /// <returns><see langword="true"/> if this instance can convert the specified object type; otherwise <see langword="false"/>.</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(Cookie));
        }

        /// <summary>
        /// Reads the JSON representation of the object.
        /// </summary>
        /// <param name="reader">A JsonReader to read from.</param>
        /// <param name="objectType">Type of the object.</param>
        /// <param name="serializer">The calling serializer.</param>
        /// <returns>The object value.</returns>
        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            return null;
        }

        /// <summary>
        /// Writes the JSON representation of the object.
        /// </summary>
        /// <param name="writer">The JsonWriter to write to.</param>
        /// <param name="value">The value.</param>
        /// <param name="serializer">The calling serializer.</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            Cookie cookieValue = value as Cookie;
            if (cookieValue != null)
            {
                writer.WriteStartObject();
                
                writer.WritePropertyName("name");
                writer.WriteValue(cookieValue.Name);
                
                writer.WritePropertyName("value");
                writer.WriteValue(cookieValue.Value);

                writer.WritePropertyName("secure");
                writer.WriteValue(cookieValue.Secure);

                writer.WritePropertyName("path");
                if (!string.IsNullOrEmpty(cookieValue.Path))
                {
                    writer.WriteValue(cookieValue.Path);
                }
                else
                {
                    writer.WriteValue(string.Empty);
                }

                if (!string.IsNullOrEmpty(cookieValue.Domain))
                {
                    writer.WritePropertyName("domain");
                    writer.WriteValue(cookieValue.Domain);
                }

                if (cookieValue.Expiry != null)
                {
                    writer.WritePropertyName("expiry");
                    string dateValue = cookieValue.Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture);
                    writer.WriteValue(dateValue);
                }
                
                writer.WriteEndObject();
            }
        }
    }
}
