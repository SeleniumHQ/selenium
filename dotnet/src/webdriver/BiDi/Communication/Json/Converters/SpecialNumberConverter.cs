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

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

/// <summary>
/// Serializes and deserializes <see cref="double"/> into a
/// <see href="https://w3c.github.io/webdriver-bidi/#type-script-PrimitiveProtocolValue">BiDi spec-compliant number value</see>.
/// </summary>
internal sealed class SpecialNumberConverter : JsonConverter<double>
{
    public override double Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TryGetDouble(out double d))
        {
            return d;
        }

        var str = reader.GetString() ?? throw new JsonException("Cannot convert from null to remote number value");

        if (str.Equals("-0", StringComparison.Ordinal))
        {
            return -0.0;
        }
        else if (str.Equals("NaN", StringComparison.Ordinal))
        {
            return double.NaN;
        }
        else if (str.Equals("Infinity", StringComparison.Ordinal))
        {
            return double.PositiveInfinity;
        }
        else if (str.Equals("-Infinity", StringComparison.Ordinal))
        {
            return double.NegativeInfinity;
        }

        throw new JsonException();
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
