using System;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using NUnit.Framework;
using Moq;

namespace OpenQA.Selenium.Support.UI
{
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
        public void UntilShouldWaitUntilReturnValueOfConditionIsNotNull()
        {
            var condition = GetCondition(() => defaultReturnValue,
                                         () => defaultReturnValue);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.AreEqual(defaultReturnValue, wait.Until(condition));
        }

        [Test]
        public void UntilAsyncShouldWaitUntilReturnValueOfConditionIsNotNull()
        {
            var condition = GetAsyncCondition(() => defaultReturnValue,
                () => defaultReturnValue);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.AreEqual(defaultReturnValue, wait.UntilAsync(condition).Result);
        }

        [Test]
        public void UntilShouldWaitUntilABooleanResultIsTrue()
        {
            var condition = GetCondition(() => true,
                                         () => true);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.IsTrue(wait.Until(condition));
        }

        [Test]
        public void UntilAsyncShouldWaitUntilABooleanResultIsTrue()
        {
            var condition = GetAsyncCondition(() => true,
                () => true);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.IsTrue(wait.UntilAsync(condition).Result);
        }

        [Test]
        public void UntilChecksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed()
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
        public void UntilAsyncChecksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed()
        {
            var condition = GetAsyncCondition(() => null,
                () => defaultReturnValue);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);

            Assert.ThrowsAsync<WebDriverTimeoutException>(() => wait.UntilAsync(condition), "Timed out after 0 seconds");
        }

        [Test]
        public void UntilCanIgnoreMultipleExceptions()
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

            Assert.AreEqual(defaultReturnValue, wait.Until(condition));
        }

        [Test]
        public void UntilAsyncCanIgnoreMultipleExceptions()
        {
            var condition = GetAsyncCondition(() => { throw new NoSuchElementException(); },
                () => { throw new NoSuchFrameException(); },
                () => defaultReturnValue);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            Assert.AreEqual(defaultReturnValue, wait.UntilAsync(condition).Result);
        }

        [Test]
        public void UntilPropagatesUnIgnoredExceptions()
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
            Assert.AreSame(ex, caughtException);

            // Regression test for issue #6343
            StringAssert.Contains("NonInlineableThrow", caughtException.StackTrace, "the stack trace must include the call to NonInlineableThrow()");
        }

        [Test]
        public void UntilAsyncPropagatesUnIgnoredExceptions()
        {
            var ex = new NoSuchWindowException("");
            var condition = GetAsyncCondition<object>(() => { NonInlineableThrow(ex); return null; });
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(true);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchElementException), typeof(NoSuchFrameException));

            var caughtException = Assert.ThrowsAsync<NoSuchWindowException>(() => wait.UntilAsync(condition));
            Assert.AreSame(ex, caughtException);

            // Regression test for issue #6343
            StringAssert.Contains("NonInlineableThrow", caughtException.StackTrace, "the stack trace must include the call to NonInlineableThrow()");
        }

        [Test]
        public void UntilTimeoutMessageIncludesLastIgnoredException()
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
            Assert.AreSame(ex, caughtException.InnerException);
        }

        [Test]
        public void UntilAsyncTimeoutMessageIncludesLastIgnoredException()
        {
            var ex = new NoSuchWindowException("");
            var condition = GetAsyncCondition<object>(() => { throw ex; });
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.PollingInterval = TimeSpan.FromSeconds(2);
            wait.IgnoreExceptionTypes(typeof(NoSuchWindowException));

            var caughtException = Assert.ThrowsAsync<WebDriverTimeoutException>(() => wait.UntilAsync(condition));
            Assert.AreSame(ex, caughtException.InnerException);
        }

        [Test]
        public void UnitTimeoutMessageIncludesCustomMessage()
        {
            var condition = GetCondition(() => false);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.Message = "Expected custom timeout message";

            Assert.Throws<WebDriverTimeoutException>(() => wait.Until(condition), "Timed out after 0 seconds: Expected custom timeout message");
        }

        [Test]
        public void UntilAsyncTimeoutMessageIncludesCustomMessage()
        {
            var condition = GetAsyncCondition(() => false);
            mockClock.Setup(_ => _.LaterBy(It.Is<TimeSpan>(x => x == TimeSpan.FromMilliseconds(0)))).Returns(startDate.Add(TimeSpan.FromSeconds(2)));
            mockClock.Setup(_ => _.IsNowBefore(It.Is<DateTime>(x => x == startDate.Add(TimeSpan.FromSeconds(2))))).Returns(false);

            IWait<IWebDriver> wait = new DefaultWait<IWebDriver>(mockDriver.Object, mockClock.Object);
            wait.Timeout = TimeSpan.FromMilliseconds(0);
            wait.Message = "Expected custom timeout message";

            Assert.ThrowsAsync<WebDriverTimeoutException>(() => wait.UntilAsync(condition), "Timed out after 0 seconds: Expected custom timeout message");
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

        private Func<IWebDriver, Task<T>> GetAsyncCondition<T>(params Func<T>[] functions)
        {
            return driver => Task.FromResult(GetCondition(functions).Invoke(driver));
        }
    }
}
