using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox.Internal
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
            StringBuilder stringValue = new StringBuilder();
            // We need a custom writer for char arrays, such as are used with SendKeys.
            // JSON.NET does not properly handle converting unicode characters to \uxxxx.
            //writer.WriteStartArray();
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
                        //writer.WriteValue(currentChar);
                    }
                    else
                    {
                        string charRepresentation = "\\u" + Convert.ToString(codepoint, 16).PadLeft(4, '0');
                        //writer.WriteRawValue("\"" + charRepresentation + "\"");
                        stringValue.Append(charRepresentation);
                    }
                }
            }
            writer.WriteRawValue("\"" + stringValue.ToString() + "\"");
            //writer.WriteEndArray();
        }
    }
}
