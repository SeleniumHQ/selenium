using System;
using System.Runtime.CompilerServices;
using NUnit.Framework;
using NMock;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class DefaultWaitTest
    {
        private MockFactory mocks;
        private Mock<IWebDriver> mockDriver;
        private Mock<IClock> mockClock;

        private int executionCount;
        private DateTime startDate = new DateTime(2011, 1, 1, 13, 30, 0);
        private readonly object defaultReturnValue = new object();

        [SetUp]
        public void Setup()
        {
            mocks = new MockFactory();
            mockDriver = mocks.CreateMock<IWebDriver>();
            mockClock = mocks.CreateMock<IClock>();
            executionCount = 0;
        }

        [Test]
        public void ShouldWaitUntilReturnValueOfConditionIsNotNull()
        {
            var condition = GetCondition(() => defaultReturnValue,
                                         () => defaultReturnValue);
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.AreEqual(defaultReturnValue, wait.Until(condition));
        }

        [Test]
        public void ShouldWaitUntilABooleanResultIsTrue()
        {
            var condition = GetCondition(() => true,
                                         () => true);
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.IsTrue(wait.Until(condition));
        }

        [Test]
        public void ChecksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed()
        {
            var condition = GetCondition(() => null,
                                         () => defaultReturnValue);
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);

            Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition), "Timed out after 0 seconds");
        }

        [Test]
        public void CanIgnoreMultipleExceptions()
        {
            var condition = GetCondition(() => { throw new NoSuchElementException(); },
                                         () => { throw new NoSuchFrameException(); },
                                         () => defaultReturnValue);
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.Exactly(3).Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.AreEqual(defaultReturnValue, wait.Until(condition));
        }

        [Test]
        public void PropagatesUnIgnoredExceptions()
        {
            var ex = new NoSuchWindowException("");
            var condition = GetCondition<object>(() => { NonInlineableThrow(ex); return null; });
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            var caughtException = Assert.Throws<NoSuchWindowException>(() => wait.Until(condition));
            Assert.AreSame(ex, caughtException);

            // Regression test for issue #6343
            StringAssert.Contains("NonInlineableThrow", caughtException.StackTrace, "the stack trace must include the call to NonInlineableThrow()");
        }

        [Test]
        public void TimeoutMessageIncludesLastIgnoredException()
        {
            var ex = new NoSuchWindowException("");
            var condition = GetCondition<object>(() => { throw ex; });
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchWindowException));

            var caughtException = Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition));
            Assert.AreSame(ex, caughtException.InnerException);
        }

        [Test]
        public void TmeoutMessageIncludesCustomMessage()
        {
            var condition = GetCondition(() => false);
            mockClock.Expects.One.Method(_ => _.LaterBy(TimeSpan.Zero)).With(TimeSpan.FromMilliseconds(0)).WillReturn(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Expects.One.Method(_ => _.IsNowBefore(DateTime.MinValue)).With(startDate.Add(TimeSpan.FromSeconds(2))).WillReturn(false);
            mockClock.Expects.One.Method(_ => _.IsNowBefore(startDate.Add(TimeSpan.FromSeconds(2)))).WillReturn(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.MockObject, mockClock.MockObject);
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
}
