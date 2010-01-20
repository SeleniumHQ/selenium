using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Converter used to convert <see cref="Command"/> objects to the proper JSON format.
    /// </summary>
    internal class ResponseValueJsonConverter : JsonConverter
    {
        /// <summary>
        /// Determines whether this instance can convert the specified object type.
        /// </summary>
        /// <param name="objectType">Type of the object.</param>
        /// <returns><see langword="true"/> if this instance can convert the specified object type; otherwise <see langword="false"/>.</returns>
        public override bool CanConvert(Type objectType)
        {
            return true;
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
            return ProcessToken(reader);
        }

        /// <summary>
        /// Writes the JSON representation of the object.
        /// </summary>
        /// <param name="writer">The JsonWriter to write to.</param>
        /// <param name="value">The value.</param>
        /// <param name="serializer">The calling serializer.</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
        }

        private object ProcessToken(JsonReader reader)
        {
            // Recursively processes a token. This is required for elements that next other elements.
            object processedObject = null;
            if (reader.TokenType == JsonToken.StartObject)
            {
                Dictionary<string, object> dictionaryValue = new Dictionary<string, object>();
                while (reader.Read() && reader.TokenType != JsonToken.EndObject)
                {
                    string elementKey = reader.Value.ToString();
                    reader.Read();
                    dictionaryValue.Add(elementKey, ProcessToken(reader));
                }

                processedObject = dictionaryValue;
            }
            else if (reader.TokenType == JsonToken.StartArray)
            {
                List<object> arrayValue = new List<object>();
                while (reader.Read() && reader.TokenType != JsonToken.EndArray)
                {
                    arrayValue.Add(ProcessToken(reader));
                }

                processedObject = arrayValue.ToArray();
            }
            else
            {
                processedObject = reader.Value;
            }

            return processedObject;
        }
    }
}
