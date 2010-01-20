using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Converter used to convert arrays of char to the proper JSON format.
    /// </summary>
    internal class CharArrayJsonConverter : JsonConverter
    {
        /// <summary>
        /// Determines whether this instance can convert the specified object type.
        /// </summary>
        /// <param name="objectType">Type of the object.</param>
        /// <returns><see langword="true"/> if this instance can convert the specified object type; otherwise <see langword="false"/>.</returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(char[]));
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
            throw new NotImplementedException();
        }

        /// <summary>
        /// Writes the JSON representation of the object.
        /// </summary>
        /// <param name="writer">The JsonWriter to write to.</param>
        /// <param name="value">The value.</param>
        /// <param name="serializer">The calling serializer.</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            StringBuilder stringValue = new StringBuilder();

            // We need a custom writer for char arrays, such as are used with SendKeys.
            // JSON.NET does not properly handle converting unicode characters to \uxxxx.
            // writer.WriteStartArray();
            char[] arrayObject = value as char[];
            if (arrayObject != null)
            {
                foreach (char currentChar in arrayObject)
                {
                    if (currentChar == '"' || currentChar == '\\' || currentChar == '/')
                    {
                        stringValue.Append("\\");
                    }

                    int codepoint = Convert.ToInt32(currentChar);
                    if ((codepoint >= 32) && (codepoint <= 126))
                    {
                        stringValue.Append(currentChar);
                    }
                    else
                    {
                        string charRepresentation = "\\u" + Convert.ToString(codepoint, 16).PadLeft(4, '0');
                        stringValue.Append(charRepresentation);
                    }
                }
            }

            writer.WriteRawValue("\"" + stringValue.ToString() + "\"");
        }
    }
}
