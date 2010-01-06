using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    internal class ResponseValueJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return true;
        }

        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            return ProcessToken(reader);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        private object ProcessToken(JsonReader reader)
        {
            // Recursively processes a token. This is required for elements that next other elements.
            object processedObject = null;
            if (reader.TokenType == Newtonsoft.Json.JsonToken.StartObject)
            {
                Dictionary<string, object> dictionaryValue = new Dictionary<string, object>();
                while (reader.Read() && reader.TokenType != Newtonsoft.Json.JsonToken.EndObject)
                {
                    string elementKey = reader.Value.ToString();
                    reader.Read();
                    dictionaryValue.Add(elementKey, ProcessToken(reader));
                }
                processedObject = dictionaryValue;
            }
            else if (reader.TokenType == Newtonsoft.Json.JsonToken.StartArray)
            {
                List<object> arrayValue = new List<object>();
                while (reader.Read() && reader.TokenType != Newtonsoft.Json.JsonToken.EndArray)
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
