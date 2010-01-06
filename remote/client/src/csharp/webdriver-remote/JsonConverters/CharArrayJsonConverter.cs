using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    internal class CharArrayJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(char[]));
        }

        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

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
