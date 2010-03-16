using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Converts the response to JSON
    /// </summary>
    internal class ResponseValueJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if the object can be converted
        /// </summary>
        /// <param name="objectType">The object to be converted</param>
        /// <returns>True if it can be converted or false if can't be</returns>
        public override bool CanConvert(Type objectType)
        {
            return true;
        }

        /// <summary>
        /// Pricess the reader to return an object from JSON
        /// </summary>
        /// <param name="reader">A JSON reader</param>
        /// <param name="objectType">Type of the object</param>
        /// <param name="serializer">JSON Serializer</param>
        /// <returns>Object created from JSON</returns>
        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            return ProcessToken(reader);
        }

        /// <summary>
        /// Writes objects to JSON. Currently not implemented
        /// </summary>
        /// <param name="writer">JSON Writer Object</param>
        /// <param name="value">Value to be written</param>
        /// <param name="serializer">JSON Serializer </param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            serializer.Serialize(writer, value);
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
