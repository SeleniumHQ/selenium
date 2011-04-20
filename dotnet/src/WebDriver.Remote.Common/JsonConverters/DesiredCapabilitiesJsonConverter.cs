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
            return objectType.IsAssignableFrom(typeof(DesiredCapabilities));
        }

        /// <summary>
        /// Get the capabilities from the JSON reader
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="existingValue">The exisiting value of the object</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Platform from JSON reader</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return serializer.Deserialize(reader);
        }

        /// <summary>
        /// Creates a JSON string representing the DesiredCapabilities object
        /// </summary>
        /// <param name="writer">The JSON writer with a string</param>
        /// <param name="value">Value of the string</param>
        /// <param name="serializer">JSON serializer instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            DesiredCapabilities capabilities = value as DesiredCapabilities;
            if (capabilities != null)
            {
                writer.WriteStartObject();
                foreach (string name in capabilities.Capabilities.Keys)
                {
                    writer.WritePropertyName(name);
                    writer.WriteRawValue(JsonConvert.SerializeObject(capabilities.Capabilities[name], new PlatformJsonConverter()));
                }

                writer.WriteEndObject();
            }
        }
    }
}
