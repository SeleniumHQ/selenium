// <copyright file="DefaultWaitTest.cs" company="Selenium Committers">
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
using System.Runtime.CompilerServices;

namespace OpenQA.Selenium.Support.UI;

[TestFixture]
public class DefaultWaitTest
{
    private Mock<IWebDriver> mockDriver;
    private Mock<IClock> mockClock;

    private int executionCount;
    private DateTime startDate = new DateTime(2011, 1, 1, 13, 30, 0);
    private readonly object defaultReturnValue = new object();

    [SetUp]
    public void Setup()
    {
        mockDriver = new Mock<IWebDriver>();
        mockClock = new Mock<IClock>();
        executionCount = 0;
    }

    [Test]
    public void ShouldWaitUntilReturnValueOfConditionIsNotNull()
    {
        var condition = GetCondition(() => defaultReturnValue,
                                     () => defaultReturnValue);
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.PollingInterval = TimeSpan.FromSeconds(2);
        wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

        Assert.That(wait.Until(condition), Is.EqualTo(defaultReturnValue));
    }

    [Test]
    public void ShouldWaitUntilABooleanResultIsTrue()
    {
        var condition = GetCondition(() => true,
                                     () => true);
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.PollingInterval = TimeSpan.FromSeconds(2);
        wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

        Assert.That(wait.Until(condition), Is.True);
    }

    [Test]
    public void ChecksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed()
    {
        var condition = GetCondition(() => null,
                                     () => defaultReturnValue);
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);

        Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition), "Timed out after 0 seconds");
    }

    [Test]
    public void CanIgnoreMultipleExceptions()
    {
        var condition = GetCondition(() => { throw new NoSuchElementException(); },
                                     () => { throw new NoSuchFrameException(); },
                                     () => defaultReturnValue);
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.PollingInterval = TimeSpan.FromSeconds(2);
        wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

        Assert.That(wait.Until(condition), Is.EqualTo(defaultReturnValue));
    }

    [Test]
    public void PropagatesUnIgnoredExceptions()
    {
        var ex = new NoSuchWindowException("");
        var condition = GetCondition<object>(() => { NonInlineableThrow(ex); return null; });
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.PollingInterval = TimeSpan.FromSeconds(2);
        wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

        var caughtException = Assert.Throws<NoSuchWindowException>(() => wait.Until(condition));
        Assert.That(caughtException, Is.SameAs(ex));

        // Regression test for issue #6343
        Assert.That(caughtException.StackTrace, Does.Contain("NonInlineableThrow"), "the stack trace must include the call to NonInlineableThrow()");
    }

    [Test]
    public void TimeoutMessageIncludesLastIgnoredException()
    {
        var ex = new NoSuchWindowException("");
        var condition = GetCondition<object>(() => { throw ex; });
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.PollingInterval = TimeSpan.FromSeconds(2);
        wait.IgnoreExceptionTypes(typeof(NoSuchWindowException));

        var caughtException = Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition));
        Assert.That(caughtException.InnerException, Is.SameAs(ex));
    }

    [Test]
    public void TmeoutMessageIncludesCustomMessage()
    {
        var condition = GetCondition(() => false);
        mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
        mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

        IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
        wait.Timeout = TimeSpan.FromMilliseconds(0);
        wait.Message = "Expected custom timeout message";

        Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition), "Timed out after 0 seconds: Expected custom timeout message");
    }

    // Prevent inlining, because there is an assertion for the stack frame of this method
    [MethodImpl(MethodImplOptions.NoInlining)]
    private void NonInlineableThrow(Exception exception)
    {
        throw exception;
    }

    private Func<IWebDriver, T> GetCondition<T>(params Func<T>[] functions)
    {
        return driver =>
        {
            try
            {
                var result = functions[executionCount]();
                return result;
            }
            finally
            {
                executionCount++;
            }
        };
    }
}
