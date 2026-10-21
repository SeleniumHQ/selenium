// <copyright file="RemoteValueConversionTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Script;

namespace OpenQA.Selenium.Tests.BiDi.Script;

internal class RemoteValueConversionTests
{
    [Test]
    public void CanConvertToNullable()
    {
        NullRemoteValue arg = new();

        AssertValue(arg.ConvertTo<bool?>());
        AssertValue(arg.ConvertTo<byte?>());
        AssertValue(arg.ConvertTo<sbyte?>());
        AssertValue(arg.ConvertTo<short?>());
        AssertValue(arg.ConvertTo<ushort?>());
        AssertValue(arg.ConvertTo<int?>());
        AssertValue(arg.ConvertTo<uint?>());
        AssertValue(arg.ConvertTo<long?>());
        AssertValue(arg.ConvertTo<ulong?>());
        AssertValue(arg.ConvertTo<double?>());
        AssertValue(arg.ConvertTo<float?>());
        AssertValue(arg.ConvertTo<decimal?>());
        AssertValue(arg.ConvertTo<string>());

        static void AssertValue<T>(T value)
        {
            Assert.That(value, Is.Null);
        }
    }

    [Test]
    public void CanConvertToBool()
    {
        BooleanRemoteValue arg = new(true);

        AssertValue(arg.ConvertTo<bool>());
        AssertValue((bool)arg);

        static void AssertValue(bool value)
        {
            Assert.That(value, Is.True);
        }
    }

    [Test]
    public void CanConvertToByte()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<byte>());

        static void AssertValue(byte value)
        {
            Assert.That(value, Is.EqualTo((byte)6));
        }
    }

    [Test]
    public void CanConvertToSByte()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<sbyte>());

        static void AssertValue(sbyte value)
        {
            Assert.That(value, Is.EqualTo((sbyte)6));
        }
    }

    [Test]
    public void CanConvertToInt16()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<short>());
        AssertValue((short)arg);

        static void AssertValue(short value)
        {
            Assert.That(value, Is.EqualTo((short)6));
        }
    }

    [Test]
    public void CanConvertToUInt16()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<ushort>());
        AssertValue((ushort)arg);

        static void AssertValue(ushort value)
        {
            Assert.That(value, Is.EqualTo((ushort)6));
        }
    }

    [Test]
    public void CanConvertToInt32()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<int>());
        AssertValue((int)arg);

        static void AssertValue(int value)
        {
            Assert.That(value, Is.EqualTo(6));
        }
    }

    [Test]
    public void CanConvertToUInt32()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<uint>());
        AssertValue((uint)arg);

        static void AssertValue(uint value)
        {
            Assert.That(value, Is.EqualTo(6U));
        }
    }

    [Test]
    public void CanConvertToInt64()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<long>());
        AssertValue((long)arg);

        static void AssertValue(long value)
        {
            Assert.That(value, Is.EqualTo(6L));
        }
    }

    [Test]
    public void CanConvertToUInt64()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<ulong>());

        static void AssertValue(ulong value)
        {
            Assert.That(value, Is.EqualTo(6UL));
        }
    }

    [Test]
    public void CanConvertToDouble()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<double>());
        AssertValue((double)arg);

        static void AssertValue(double value)
        {
            Assert.That(value, Is.EqualTo(5.9d));
        }
    }

    [Test]
    public void CanConvertToFloat()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<float>());
        AssertValue((float)arg);

        static void AssertValue(float value)
        {
            Assert.That(value, Is.EqualTo(5.9f));
        }
    }

    [Test]
    public void CanConvertToDecimal()
    {
        NumberRemoteValue arg = new(5.9);

        AssertValue(arg.ConvertTo<decimal>());

        static void AssertValue(decimal value)
        {
            Assert.That(value, Is.EqualTo(5.9m));
        }
    }

    [Test]
    public void CanConvertToString()
    {
        StringRemoteValue arg = new("abc");

        AssertValue(arg.ConvertTo<string>());
        AssertValue((string)arg);

        static void AssertValue(string value)
        {
            Assert.That(value, Is.EqualTo("abc"));
        }
    }

    [Test]
    public void CanConvertToArray()
    {
        ArrayRemoteValue arg = new() { Value = [new NumberRemoteValue(1), new NumberRemoteValue(2)] };

        AssertValue(arg.ConvertTo<int[]>());

        static void AssertValue(int[] value)
        {
            Assert.That(value, Is.EqualTo(new int[] { 1, 2 }));
        }
    }

    [Test]
    public void CanConvertToEmptyArray()
    {
        ArrayRemoteValue arg = new();

        AssertValue(arg.ConvertTo<int[]>());

        static void AssertValue(int[] value)
        {
            Assert.That(value, Is.Empty);
        }
    }

    [Test]
    public void CanConvertToEnumerableOf()
    {
        ArrayRemoteValue arg = new() { Value = [new NumberRemoteValue(1), new NumberRemoteValue(2)] };

        AssertValue(arg.ConvertTo<List<int>>());

        AssertValue(arg.ConvertTo<IEnumerable<int>>());
        AssertValue(arg.ConvertTo<IReadOnlyList<int>>());
        AssertValue(arg.ConvertTo<IReadOnlyCollection<int>>());
        AssertValue(arg.ConvertTo<IList<int>>());
        AssertValue(arg.ConvertTo<ICollection<int>>());

        static void AssertValue(IEnumerable<int> value)
        {
            Assert.That(value, Is.EqualTo(new List<int> { 1, 2 }));
        }
    }

    [Test]
    public void CanConvertToEmptyEnumerableOf()
    {
        ArrayRemoteValue arg = new();

        AssertValue(arg.ConvertTo<List<int>>());

        AssertValue(arg.ConvertTo<IEnumerable<int>>());

        static void AssertValue(IEnumerable<int> value)
        {
            Assert.That(value, Is.Empty);
        }
    }

    [Test]
    public void CanConvertMapRemoteValueToDictionary()
    {
        MapRemoteValue arg = new()
        {
            Value =
            [
                [new StringRemoteValue("key1"), new NumberRemoteValue(1)],
                [new StringRemoteValue("key2"), new NumberRemoteValue(2)],
            ]
        };

        AssertValue(arg.ConvertTo<Dictionary<string, int>>());
        AssertValue(arg.ConvertTo<IDictionary<string, int>>());

        static void AssertValue(IDictionary<string, int> value)
        {
            Assert.That(value, Has.Count.EqualTo(2));
            Assert.That(value["key1"], Is.EqualTo(1));
            Assert.That(value["key2"], Is.EqualTo(2));
        }
    }

    [Test]
    public void CanConvertEmptyMapRemoteValueToDictionary()
    {
        MapRemoteValue arg = new();

        AssertValue(arg.ConvertTo<Dictionary<string, int>>());

        static void AssertValue(IDictionary<string, int> value)
        {
            Assert.That(value, Is.Empty);
        }
    }

    [Test]
    public void CanConvertObjectRemoteValueToDictionary()
    {
        ObjectRemoteValue arg = new()
        {
            Value =
            [
                [new StringRemoteValue("a"), new BooleanRemoteValue(true)],
                [new StringRemoteValue("b"), new BooleanRemoteValue(false)],
            ]
        };

        AssertValue(arg.ConvertTo<Dictionary<string, bool>>());
        AssertValue(arg.ConvertTo<IDictionary<string, bool>>());

        static void AssertValue(IDictionary<string, bool> value)
        {
            Assert.That(value, Has.Count.EqualTo(2));
            Assert.That(value["a"], Is.True);
            Assert.That(value["b"], Is.False);
        }
    }

    [Test]
    public void CanConvertEmptyObjectRemoteValueToDictionary()
    {
        ObjectRemoteValue arg = new();

        AssertValue(arg.ConvertTo<Dictionary<string, string>>());

        static void AssertValue(IDictionary<string, string> value)
        {
            Assert.That(value, Is.Empty);
        }
    }
}
