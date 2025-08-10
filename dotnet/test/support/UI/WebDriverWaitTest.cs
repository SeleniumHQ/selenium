// <copyright file="WebDriverWaitTest.cs" company="Selenium Committers">
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

using Moq;
using NUnit.Framework;
using System;

namespace OpenQA.Selenium.Support.UI;

[TestFixture]
public class WebDriverWaitTest
{
    private const string SOME_STRING = "str";

    private static readonly TimeSpan ZERO_SECONDS = TimeSpan.FromSeconds(0);
    private static readonly TimeSpan ONE_SECONDS = TimeSpan.FromSeconds(1);
    private static readonly TimeSpan FIVE_SECONDS = TimeSpan.FromSeconds(5);

    private bool executed;

    [SetUp]
    public void SetUp()
    {
        executed = false;
    }

    [Test]
    public void CanGetListOfOptions()
    {
        var mockDriver = new Mock<IWebDriver>();
        var condition = GetCondition(() => null, () => SOME_STRING);

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
        Assert.That(wait.Until(condition), Is.EqualTo(SOME_STRING));
    }

    [Test]
    public void WaitsForBaseObjectType()
    {
        var mockDriver = new Mock<IWebDriver>();
        var condition = GetCondition(() => null, () => new object());

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
        Assert.That(wait.Until(condition), Is.Not.Null);
    }

    [Test]
    public void WaitsUntilABooleanResultIsTrue()
    {
        var mockDriver = new Mock<IWebDriver>();
        var condition = GetCondition(() => false, () => true);

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
        Assert.That(wait.Until(condition), Is.True);
    }

    [Test]
    public void ThrowsForInvalidTypes()
    {
        var mockDriver = new Mock<IWebDriver>();
        var nullableBooleanCondition = GetCondition<bool?>(() => null, () => true);
        var intCondition = GetCondition(() => 1, () => 2);

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);

        Assert.That(() => wait.Until(nullableBooleanCondition), Throws.ArgumentException);
        Assert.That(() => wait.Until(intCondition), Throws.ArgumentException);
    }

    [Test]
    public void ThrowsAnExceptionIfTheTimerRunsOut()
    {
        var mockDriver = new Mock<IWebDriver>();
        var wait = new WebDriverWait(GetClock(), mockDriver.Object, ONE_SECONDS, ZERO_SECONDS);

        Assert.That(
            () => wait.Until(driver => false),
            Throws.TypeOf<WebDriverTimeoutException>());
    }

    [Test]
    public void SilentlyCapturesNoSuchElementExceptions()
    {
        var mockDriver = new Mock<IWebDriver>();
        var element = new Mock<IWebElement>();
        var condition = GetCondition(() => { throw new NoSuchElementException(); }, () => element.Object);

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);

        Assert.That(wait.Until(condition), Is.EqualTo(element.Object));
    }

    [Test]
    public void PassesWebDriverFromConstructorToExpectation()
    {
        var mockDriver = new Mock<IWebDriver>();
        mockDriver.SetupGet<string>(_ => _.CurrentWindowHandle).Returns(SOME_STRING);

        Func<IWebDriver, string> condition = driver => driver.CurrentWindowHandle;

        var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);

        Assert.That(wait.Until(condition), Is.EqualTo(SOME_STRING));

        mockDriver.Verify(_ => _.CurrentWindowHandle, Times.Once);
    }

    [Test]
    public void ChainsNoSuchElementExceptionWhenTimingOut()
    {
        var mockDriver = new Mock<IWebDriver>();
        var condition = GetCondition<string>(() => { throw new NoSuchElementException(); }, () => { throw new NoSuchElementException(); });

        var wait = new WebDriverWait(GetClock(), mockDriver.Object, ONE_SECONDS, ZERO_SECONDS);

        Assert.That(
            () => wait.Until(condition),
            Throws.InstanceOf<WebDriverTimeoutException>().With.InnerException.InstanceOf<NoSuchElementException>());
    }

    private Func<IWebDriver, T> GetCondition<T>(Func<T> first, Func<T> second)
    {
        return driver =>
        {
            if (executed)
            {
                return second();
            }
            executed = true;
            return first();
        };
    }

    private static IClock GetClock()
    {
        return new TickingClock(TimeSpan.FromMilliseconds(500));
    }
}

class TickingClock : IClock
{
    private readonly TimeSpan increment;

    public TickingClock() : this(TimeSpan.FromSeconds(0))
    {

    }

    public TickingClock(TimeSpan increment)
    {
        this.increment = increment;
        Now = new DateTime(0);
    }

    public DateTime Now { get; private set; }

    public DateTime LaterBy(TimeSpan delay)
    {
        return Now + delay;
    }

    public bool IsNowBefore(DateTime then)
    {
        Now = Now + increment;
        return Now < then;
    }
}
