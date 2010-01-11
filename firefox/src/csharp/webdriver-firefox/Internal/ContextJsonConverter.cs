using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal class ContextJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(Context));
        }

        public override object ReadJson(JsonReader reader, Type objectType, JsonSerializer serializer)
        {
            object contextValue = reader.Value;
            return new Context(contextValue.ToString());
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            Context contextValue = value as Context;
            if (contextValue != null)
            {
                writer.WriteValue(contextValue.ToString());
            }
        }
    }
}
