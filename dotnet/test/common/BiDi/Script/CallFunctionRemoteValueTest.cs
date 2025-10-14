// <copyright file="CallFunctionRemoteValueTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

public class CallFunctionRemoteValueTest : BiDiTestFixture
{
    [Test]
    public async Task CanCallFunctionAndReturnUndefined()
    {
        var response = await context.Script.CallFunctionAsync("() => { return undefined; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<UndefinedRemoteValue>());
    }

    [Test]
    public async Task CanCallFunctionAndReturnNull()
    {
        var response = await context.Script.CallFunctionAsync("() => { return null; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NullRemoteValue>());
    }

    [Test]
    public async Task CanCallFunctionAndReturnTrue()
    {
        var response = await context.Script.CallFunctionAsync("() => { return true; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<BooleanRemoteValue>());
        Assert.That(((BooleanRemoteValue)response.AsSuccessResult()).Value, Is.True);
    }

    [Test]
    public async Task CanCallFunctionAndReturnFalse()
    {
        var response = await context.Script.CallFunctionAsync("() => { return false; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<BooleanRemoteValue>());
        Assert.That(((BooleanRemoteValue)response.AsSuccessResult()).Value, Is.False);
    }


    [Test]
    public async Task CanCallFunctionAndReturnEmptyString()
    {
        var response = await context.Script.CallFunctionAsync("() => { return ''; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<StringRemoteValue>());
        Assert.That(((StringRemoteValue)response.AsSuccessResult()).Value, Is.Empty);
    }

    [Test]
    public async Task CanCallFunctionAndReturnNonEmptyString()
    {
        var response = await context.Script.CallFunctionAsync("() => { return 'whoa'; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<StringRemoteValue>());
        Assert.That(((StringRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo("whoa"));
    }

    [Test]
    public async Task CanCallFunctionAndReturnRecentDate()
    {
        const string PinnedDateTimeString = "2025-03-09T00:30:33.083Z";

        var response = await context.Script.CallFunctionAsync($$"""() => { return new Date('{{PinnedDateTimeString}}'); }""", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<DateRemoteValue>());
        Assert.That(response.AsSuccessResult(), Is.EqualTo(new DateRemoteValue(PinnedDateTimeString)));
    }

    [Test]
    public async Task CanCallFunctionAndReturnUnixEpoch()
    {
        const string EpochString = "1970-01-01T00:00:00.000Z";

        var response = await context.Script.CallFunctionAsync($$"""() => { return new Date('{{EpochString}}'); }""", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<DateRemoteValue>());
        Assert.That(response.AsSuccessResult(), Is.EqualTo(new DateRemoteValue(EpochString)));
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberFive()
    {
        var response = await context.Script.CallFunctionAsync("() => { return 5; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());
        Assert.That(((NumberRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(5));
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberNegativeFive()
    {
        var response = await context.Script.CallFunctionAsync("() => { return -5; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());
        Assert.That(((NumberRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(-5));
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberZero()
    {
        var response = await context.Script.CallFunctionAsync("() => { return 0; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());
        Assert.That(((NumberRemoteValue)response.AsSuccessResult()).Value, Is.Zero);
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberNegativeZero()
    {
        var response = await context.Script.CallFunctionAsync("() => { return -0; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());

        var actualNumberValue = ((NumberRemoteValue)response.AsSuccessResult()).Value;
        Assert.That(actualNumberValue, Is.Zero);
        Assert.That(double.IsNegative(actualNumberValue), Is.True);
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberPositiveInfinity()
    {
        var response = await context.Script.CallFunctionAsync("() => { return Number.POSITIVE_INFINITY; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());

        var expectedInfinity = ((NumberRemoteValue)response.AsSuccessResult()).Value;
        Assert.That(double.IsPositiveInfinity(expectedInfinity));
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberNegativeInfinity()
    {
        var response = await context.Script.CallFunctionAsync("() => { return Number.NEGATIVE_INFINITY; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());

        var expectedInfinity = ((NumberRemoteValue)response.AsSuccessResult()).Value;
        Assert.That(double.IsNegativeInfinity(expectedInfinity));
    }

    [Test]
    public async Task CanCallFunctionAndReturnNumberNaN()
    {
        var response = await context.Script.CallFunctionAsync("() => { return NaN; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<NumberRemoteValue>());
        var expectedInfinity = ((NumberRemoteValue)response.AsSuccessResult()).Value;
        Assert.That(double.IsNaN(expectedInfinity));
    }

    [Test]
    public async Task CanCallFunctionAndReturnRegExp()
    {
        var response = await context.Script.CallFunctionAsync("() => { return /foo*/g; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<RegExpRemoteValue>());
        Assert.That(response.AsSuccessResult(), Is.EqualTo(new RegExpRemoteValue(new RegExpValue("foo*") { Flags = "g" })));
    }

    [Test]
    public async Task CanCallFunctionAndReturnArray()
    {
        var response = await context.Script.CallFunctionAsync("() => { return ['hi']; }", false);

        var expectedArray = new ArrayRemoteValue { Value = [new StringRemoteValue("hi")] };
        Assert.That(response.AsSuccessResult(), Is.AssignableTo<ArrayRemoteValue>());
        Assert.That(((ArrayRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(expectedArray.Value));
    }

    [Test]
    public async Task CanCallFunctionAndReturnObject()
    {
        var response = await context.Script.CallFunctionAsync("() => { return { objKey: 'objValue' }; }", false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<ObjectRemoteValue>());

        var expected = new ObjectRemoteValue
        {
            Value = [[new StringRemoteValue("objKey"), new StringRemoteValue("objValue")]]
        };
        Assert.That(((ObjectRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(expected.Value));
    }

    [Test]
    public async Task CanCallFunctionAndReturnMap()
    {
        var expected = new MapRemoteValue
        {
            Value = [[new StringRemoteValue("mapKey"), new StringRemoteValue("mapValue")]]
        };

        var response = await context.Script.CallFunctionAsync($$"""
            () => {
              const map = new Map();
              map.set('mapKey', 'mapValue');
              return map;
            }
            """, false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<MapRemoteValue>());
        Assert.That(((MapRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(expected.Value));
    }

    [Test]
    public async Task CanCallFunctionAndReturnSet()
    {
        var expected = new SetRemoteValue { Value = [new StringRemoteValue("setKey")] };
        var response = await context.Script.CallFunctionAsync($$"""
            () => {
              const set = new Set();
              set.add('setKey');
              return set;
            }
            """, false);

        Assert.That(response.AsSuccessResult(), Is.AssignableTo<SetRemoteValue>());
        Assert.That(((SetRemoteValue)response.AsSuccessResult()).Value, Is.EqualTo(expected.Value));
    }
}
