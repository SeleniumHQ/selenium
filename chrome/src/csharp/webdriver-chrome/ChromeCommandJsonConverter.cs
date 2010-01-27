using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{
    internal class ChromeCommandJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(ChromeCommand));
        }

        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

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
