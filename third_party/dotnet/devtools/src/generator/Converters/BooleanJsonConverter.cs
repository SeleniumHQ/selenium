using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevToolsGenerator.Converters
{
    /// <summary>
    /// Handles converting JSON string values into a C# boolean data type.
    /// </summary>
    public class BooleanJsonConverter : JsonConverter<bool>
    {
        public override bool HandleNull => false;

        public override bool Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.True:
                    return true;

                case JsonTokenType.False:
                    return false;

                case JsonTokenType.String:
                    string boolString = reader.GetString()!;
                    if (bool.TryParse(boolString, out bool b))
                    {
                        return b;
                    }

                    boolString = boolString.ToLowerInvariant();

                    if (boolString.AsSpan().Trim().SequenceEqual("yes".AsSpan()) ||
                        boolString.AsSpan().Trim().SequenceEqual("y".AsSpan()) ||
                        boolString.AsSpan().Trim().SequenceEqual("1".AsSpan()))
                    {
                        return true;
                    }

                    if (boolString.AsSpan().Trim().SequenceEqual("no".AsSpan()) ||
                       boolString.AsSpan().Trim().SequenceEqual("n".AsSpan()) ||
                       boolString.AsSpan().Trim().SequenceEqual("0".AsSpan()))
                    {
                        return false;
                    }

                    throw new JsonException();

                default:
                    throw new JsonException();
            }
        }

        public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
        {
            writer.WriteBooleanValue(value);
        }
    }
}
