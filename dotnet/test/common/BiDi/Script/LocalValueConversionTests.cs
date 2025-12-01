// <copyright file="LocalValueConversionTests.cs" company="Selenium Committers">
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

using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace OpenQA.Selenium.BiDi.Script;

class LocalValueConversionTests
{
    [Test]
    public void CanConvertNullBoolToLocalValue()
    {
        bool? arg = null;

        AssertValue(arg);
        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NullLocalValue>());
        }
    }

    [Test]
    public void CanConvertTrueToLocalValue()
    {
        AssertValue(true);

        AssertValue(LocalValue.ConvertFrom(true));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<BooleanLocalValue>());
            Assert.That((value as BooleanLocalValue).Value, Is.True);
        }
    }

    [Test]
    public void CanConvertFalseToLocalValue()
    {
        AssertValue(false);

        AssertValue(LocalValue.ConvertFrom(false));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<BooleanLocalValue>());
            Assert.That((value as BooleanLocalValue).Value, Is.False);
        }
    }

    [Test]
    public void CanConvertNullIntToLocalValue()
    {
        int? arg = null;

        AssertValue(arg);

        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NullLocalValue>());
        }
    }

    [Test]
    public void CanConvertZeroIntToLocalValue()
    {
        int arg = 0;

        AssertValue(arg);

        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NumberLocalValue>());
            Assert.That((value as NumberLocalValue).Value, Is.Zero);
        }
    }

    [Test]
    public void CanConvertNullDoubleToLocalValue()
    {
        double? arg = null;

        AssertValue(arg);

        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NullLocalValue>());
        }
    }

    [Test]
    public void CanConvertZeroDoubleToLocalValue()
    {
        double arg = 0;

        AssertValue(arg);

        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NumberLocalValue>());
            Assert.That((value as NumberLocalValue).Value, Is.Zero);
        }
    }

    [Test]
    public void CanConvertNullStringToLocalValue()
    {
        string arg = null;

        AssertValue(arg);

        AssertValue(LocalValue.ConvertFrom(arg));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<NullLocalValue>());
        }
    }

    [Test]
    public void CanConvertStringToLocalValue()
    {
        AssertValue("value");

        AssertValue(LocalValue.ConvertFrom("value"));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<StringLocalValue>());
            Assert.That((value as StringLocalValue).Value, Is.EqualTo("value"));
        }
    }

    [Test]
    public void CanConvertDateTimeOffsetToLocalValue()
    {
        var date = new DateTimeOffset(2025, 4, 13, 5, 40, 20, 123, 456, TimeSpan.FromHours(+3));

        AssertValue(date);

        AssertValue(LocalValue.ConvertFrom(date));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<DateLocalValue>());
            Assert.That((value as DateLocalValue).Value, Is.EqualTo("2025-04-13T05:40:20.1234560+03:00"));
        }
    }

    [Test]
    public void CanConvertArrayToLocalValue()
    {
        AssertValue(LocalValue.ConvertFrom(new List<int> { 1, 2 }));

        AssertValue(LocalValue.ConvertFrom(new string[] { "a", "b" }));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<ArrayLocalValue>());
            Assert.That((value as ArrayLocalValue).Value.Count, Is.EqualTo(2));
        }
    }

    [Test]
    public void CanConvertMapToLocalValue()
    {
        AssertValue(LocalValue.ConvertFrom(new Dictionary<int, string> { { 1, "a" }, { 2, "b" } }));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<MapLocalValue>());
            Assert.That((value as MapLocalValue).Value.Count, Is.EqualTo(2));
        }
    }

    [Test]
    public void CanConvertSetToLocalValue()
    {
        AssertValue(LocalValue.ConvertFrom(new HashSet<int> { 1, 2 }));

        AssertValue(LocalValue.ConvertFrom(ImmutableHashSet.CreateRange([1, 2])));

        static void AssertValue(LocalValue value)
        {
            Assert.That(value, Is.TypeOf<SetLocalValue>());
            Assert.That((value as SetLocalValue).Value.Count, Is.EqualTo(2));
        }
    }

    [Test]
    public void CanConvertObjectValue()
    {
        var arg = new
        {
            UIntNumber = 5u,
            Array = new int[] { 1, 2 },
            List = new List<string> { "a", "b" },
            Dictionary = new Dictionary<string, object> { { "a", 1 }, { "b", 2 } },
            Set = new HashSet<string> { "a", "b" }
        };

        var value = LocalValue.ConvertFrom(arg);

        Console.WriteLine(value);

        Assert.That(value, Is.TypeOf<ObjectLocalValue>());

        var objValue = value as ObjectLocalValue;

        Assert.That(objValue.Value, Has.Exactly(5).Count);
    }
}
