using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    internal class CookieJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(Cookie));
        }

        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            Platform platformValue = null;
            if (reader.TokenType == Newtonsoft.Json.JsonToken.String)
            {
                PlatformType platformTypeValue = (PlatformType)Enum.Parse(objectType, reader.Value.ToString(), true);
                platformValue = new Platform(platformTypeValue);
            }
            return platformValue;
        }

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
                writer.WritePropertyName("path");
                if (!string.IsNullOrEmpty(cookieValue.Path))
                {
                    writer.WriteValue(cookieValue.Path);
                }
                else
                {
                    writer.WriteValue("");
                }
                writer.WritePropertyName("domain");
                if (!string.IsNullOrEmpty(cookieValue.Domain))
                {
                    writer.WriteValue(cookieValue.Domain);
                }
                else
                {
                    writer.WriteValue("");
                }
                writer.WritePropertyName("expiry");
                if (cookieValue.Expiry != null)
                {
                    string dateValue = cookieValue.Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture);
                    writer.WriteValue(dateValue);
                }
                else
                {
                    writer.WriteNull();
                }
                writer.WritePropertyName("secure");
                writer.WriteValue(cookieValue.Secure);
            }
        }
    }
}
