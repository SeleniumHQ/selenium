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
            return objectType.IsAssignableFrom(typeof(Platform));
        }

        /// <summary>
        /// Get the platform from the JSON reader
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Platform from JSON reader</returns>
        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            Platform platformValue = null;
            if (reader.TokenType == JsonToken.String)
            {
                PlatformType platformTypeValue = (PlatformType)Enum.Parse(objectType, reader.Value.ToString(), true);
                platformValue = new Platform(platformTypeValue);
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
            Platform platformValue = value as Platform;
            if (platformValue != null)
            {
                writer.WriteValue(platformValue.Type.ToString("G").ToUpper(CultureInfo.InvariantCulture));
            }
        }
    }
}
