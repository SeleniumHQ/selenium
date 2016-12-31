using System;
using System.Runtime.CompilerServices;
using NUnit.Framework;
using NMock2;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class DefaultWaitTest
    {
        private Mockery mocks;
        private IWebDriver mockDriver;
        private IClock mockClock;

        private int executionCount;
        private DateTime startDate = new DateTime(2011, 1, 1, 13, 30, 0);
        private readonly object defaultReturnValue = new object();

        [SetUp]
        public void Setup()
        {
            mocks = new Mockery();
            mockDriver = mocks.NewMock<IWebDriver>();
            mockClock = mocks.NewMock<IClock>();
            executionCount = 0;
        }

        [Test]
        public void ShouldWaitUntilReturnValueOfConditionIsNotNull()
        {
            var condition = GetCondition(() => defaultReturnValue,
                                         () => defaultReturnValue);
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);

            Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition), "Timed out after 0 seconds");
        }

        [Test]
        public void CanIgnoreMultipleExceptions()
        {
            var condition = GetCondition(() => { throw new NoSuchElementException(); },
                                         () => { throw new NoSuchFrameException(); },
                                         () => defaultReturnValue);
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
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
