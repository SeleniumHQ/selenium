using System;
using System.Collections.Generic;
using System.Text;
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
        private object defaultReturnValue = new object();

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
            var condition = GetCondition(() => { return defaultReturnValue; },
                                         () => { return defaultReturnValue; });
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
            var condition = GetCondition(() => { return true; },
                                         () => { return true; });
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.IsTrue(wait.Until(condition));
        }

        [Test]
        [ExpectedException(ExpectedException = typeof(TimeoutException), ExpectedMessage = "Timed out after 0 seconds")]
        public void ChecksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed() {
            var condition = GetCondition(() => { return null; }, 
                                         () => { return defaultReturnValue; });
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);

            wait.Until(condition);
        }

        [Test]
        public void CanIgnoreMultipleExceptions()  {
            var condition = GetCondition(() => { throw new NoSuchElementException(); return defaultReturnValue; },
                                         () => { throw new NoSuchFrameException(); return defaultReturnValue; }, 
                                         () => { return defaultReturnValue; });
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
        [ExpectedException(typeof(NoSuchWindowException))]
        public void PropagatesUnIgnoredExceptions() {
            var condition = GetCondition(() => { throw new NoSuchWindowException(""); return defaultReturnValue; });
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(true));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            wait.Until(condition);
        }

        [Test]
        public void TimeoutMessageIncludesLastIgnoredException() {
            NoSuchWindowException ex = new NoSuchWindowException("");
            var condition = GetCondition(() => { throw ex; return defaultReturnValue; });
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchWindowException));

            try
            {
                wait.Until(condition);
            }
            catch (TimeoutException e)
            {
                Assert.AreEqual(ex, e.InnerException);
            }

        }

        [Test]
        [ExpectedException(ExpectedException = typeof(TimeoutException), ExpectedMessage = "Timed out after 0 seconds: Expected custom timeout message")]
        public void TmeoutMessageIncludesCustomMessage()
        {
            var condition = GetCondition(() => { return false; });
            Expect.Once.On(mockClock).Method("LaterBy").With(TimeSpan.FromMilliseconds(0)).Will(Return.Value(startDate.Add(TimeSpan.FromSeconds(2))));
            Expect.Once.On(mockClock).Method("IsNowBefore").With(startDate.Add(TimeSpan.FromSeconds(2))).Will(Return.Value(false));

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver, mockClock);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.Message = "Expected custom timeout message";

            wait.Until(condition);
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
