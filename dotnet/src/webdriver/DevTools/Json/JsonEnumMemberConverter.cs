using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevTools.Json
{
    internal class JsonEnumMemberConverter<TEnum> : JsonConverter<TEnum> where TEnum : Enum
    {
        private readonly Dictionary<TEnum, string> _enumToString = new Dictionary<TEnum, string>();
        private readonly Dictionary<string, TEnum> _stringToEnum = new Dictionary<string, TEnum>();

        public JsonEnumMemberConverter()
        {
            var type = typeof(TEnum);
            var values = Enum.GetValues(type);

            foreach (var value in values)
            {
                var enumMember = type.GetMember(value.ToString())[0];
                var attr = enumMember.GetCustomAttributes(typeof(EnumMemberAttribute), false)
                  .Cast<EnumMemberAttribute>()
                  .FirstOrDefault();

                _stringToEnum.Add(value.ToString(), (TEnum)value);

                if (attr?.Value != null)
                {
                    _enumToString[(TEnum)value] = attr.Value;
                    _stringToEnum[attr.Value] = (TEnum)value;
                }
                else
                {
                    _enumToString.Add((TEnum)value, value.ToString());
                }
            }
        }

        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var stringValue = reader.GetString();

            if (_stringToEnum.TryGetValue(stringValue, out var enumValue))
            {
                return enumValue;
            }

            return default;
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(_enumToString[value]);
        }
    }
}
