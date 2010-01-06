using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    internal class PlatformJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(Platform));
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
            Platform platformValue = value as Platform;
            if (platformValue != null)
            {
                writer.WriteValue(platformValue.Type.ToString("G").ToUpper(CultureInfo.InvariantCulture));
            }
        }
    }
}
