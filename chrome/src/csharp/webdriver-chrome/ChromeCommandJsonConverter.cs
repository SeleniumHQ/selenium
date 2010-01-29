using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Mechanism for Converting ChromeCommands to JSON
    /// </summary>
    internal class ChromeCommandJsonConverter : JsonConverter
    {
        /// <summary>
        /// Checks if a type can be converted
        /// </summary>
        /// <param name="objectType">Object type to be converted</param>
        /// <returns>A value indicating whether it can be </returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(ChromeCommand));
        }

        /// <summary>
        /// Method not Implemented
        /// </summary>
        /// <param name="reader">JSon Reader</param>
        /// <param name="objectType">Object type to read from</param>
        /// <param name="serializer">JSON Serializer</param>
        /// <returns>An object from the JSON</returns>
        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Writes an object to JSON
        /// </summary>
        /// <param name="writer">JSON Writer object</param>
        /// <param name="value">Value to be converted</param>
        /// <param name="serializer">JSON Serializer</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            ChromeCommand command = value as ChromeCommand;
            if (command != null)
            {
                writer.WriteStartObject();
                writer.WritePropertyName("request");
                writer.WriteValue(command.RequestValue);
                for (int i = 0; i < command.ParameterNames.Length; i++)
                {
                    writer.WritePropertyName(command.ParameterNames[i]);
                    ProcessObject(writer, command.Parameters[i]);
                }

                writer.WriteEndObject();
            }
        }

        private void ProcessObject(JsonWriter writer, object value)
        {
            Dictionary<string, object> valueAsDictionary = value as Dictionary<string, object>;
            object[] valueAsArray = value as object[];
            if (valueAsDictionary != null)
            {
                writer.WriteStartObject();
                foreach (string key in valueAsDictionary.Keys)
                {
                    writer.WritePropertyName(key);
                    ProcessObject(writer, valueAsDictionary[key]);
                }

                writer.WriteEndObject();
            }
            else if (valueAsArray != null)
            {
                writer.WriteStartArray();
                foreach (object item in valueAsArray)
                {
                    ProcessObject(writer, item);
                }

                writer.WriteEndArray();
            }
            else
            {
                writer.WriteValue(value);
            }
        }
    }
}
