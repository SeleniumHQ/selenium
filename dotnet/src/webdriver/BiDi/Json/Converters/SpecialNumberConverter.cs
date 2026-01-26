// <copyright file="SpecialNumberConverter.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Json.Converters;

// Serializes and deserializes double into a BiDi spec-compliant number value.
// See https://w3c.github.io/webdriver-bidi/#type-script-PrimitiveProtocolValue
internal sealed class SpecialNumberConverter : JsonConverter<double>
{
    public override double Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        switch (reader.TokenType)
        {
            case JsonTokenType.Number:
                return reader.GetDouble();

            case JsonTokenType.String:
                var str = reader.GetString()!;
                if (str.Equals("-0", StringComparison.Ordinal))
                {
                    return -0.0;
                }

                if (str.Equals("NaN", StringComparison.Ordinal))
                {
                    return double.NaN;
                }

                if (str.Equals("Infinity", StringComparison.Ordinal))
                {
                    return double.PositiveInfinity;
                }

                if (str.Equals("-Infinity", StringComparison.Ordinal))
                {
                    return double.NegativeInfinity;
                }

                throw new JsonException($"JSON '{str}' string could not be parsed to a special number");

            default:
                throw new JsonException($"JSON type not a number or string: {reader.TokenType}");
        }
    }

    public override void Write(Utf8JsonWriter writer, double value, JsonSerializerOptions options)
    {
        if (double.IsNaN(value))
        {
            writer.WriteStringValue("NaN");
        }
        else if (double.IsPositiveInfinity(value))
        {
            writer.WriteStringValue("Infinity");
        }
        else if (double.IsNegativeInfinity(value))
        {
            writer.WriteStringValue("-Infinity");
        }
        else if (IsNegativeZero(value))
        {
            writer.WriteStringValue("-0");
        }
        else
        {
            writer.WriteNumberValue(value);
        }

        static bool IsNegativeZero(double x)
        {
            // Negative zero is less trivial to test, because 0 == -0 is true
            // We need to do a bit pattern comparison

            return BitConverter.DoubleToInt64Bits(x) == BitConverter.DoubleToInt64Bits(-0.0);
        }
    }
}
