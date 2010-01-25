using System;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to convert a Char arry to JSON
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
            return objectType.IsAssignableFrom(typeof(char[]));
        }

        /// <summary>
        /// Method not implemented
        /// </summary>
        /// <param name="reader">JSON Reader instance</param>
        /// <param name="objectType">Object type being read</param>
        /// <param name="serializer">JSON Serializer instance</param>
        /// <returns>Object from JSON</returns>
        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Writes the Object to JSON
        /// </summary>
        /// <param name="writer">A JSON Writer object</param>
        /// <param name="value">Object to be converted</param>
        /// <param name="serializer">JSON Serializer object instance</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
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
}
