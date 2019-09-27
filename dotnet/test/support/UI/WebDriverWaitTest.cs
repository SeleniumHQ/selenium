using System;
using Moq;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.UI
{
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
            Assert.AreEqual(SOME_STRING, wait.Until(condition));
        }

        [Test]
        public void WaitsForBaseObjectType()
        {
            var mockDriver = new Mock<IWebDriver>();
            var condition = GetCondition(() => null, () => new object());

            var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
            Assert.IsNotNull(wait.Until(condition));
        }

        [Test]
        public void WaitsUntilABooleanResultIsTrue()
        {
            var mockDriver = new Mock<IWebDriver>();
            var condition = GetCondition(() => false, () => true);

            var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
            Assert.True(wait.Until(condition));
        }

        [Test]
        public void ThrowsForInvalidTypes()
        {
            var mockDriver = new Mock<IWebDriver>();
            var nullableBooleanCondition = GetCondition<bool?>(() => null, () => true);
            var intCondition = GetCondition(() => 1, () => 2);

            var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
            
            Assert.Throws(typeof(ArgumentException), () => wait.Until(nullableBooleanCondition));
            Assert.Throws(typeof(ArgumentException), () => wait.Until(intCondition));
        }

        [Test]
        public void ThrowsAnExceptionIfTheTimerRunsOut()
        {
            var mockDriver = new Mock<IWebDriver>();
            var wait = new WebDriverWait(GetClock(), mockDriver.Object, ONE_SECONDS, ZERO_SECONDS);

            Assert.Throws(typeof(WebDriverTimeoutException), () => wait.Until(driver => false));
        }

        [Test]
        public void SilentlyCapturesNoSuchElementExceptions()
        {
            var mockDriver = new Mock<IWebDriver>();
            var element = new Mock<IWebElement>();
            var condition = GetCondition(() => { throw new NoSuchElementException(); }, () => element.Object);

            var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);

            Assert.AreEqual(element.Object, wait.Until(condition));
        }

        [Test]
        public void PassesWebDriverFromConstructorToExpectation()
        {
            var mockDriver = new Mock<IWebDriver>();
            mockDriver.SetupGet<string>(_ => _.CurrentWindowHandle).Returns(SOME_STRING);

            Func<IWebDriver, string> condition = driver => driver.CurrentWindowHandle;

            var wait = new WebDriverWait(new TickingClock(), mockDriver.Object, FIVE_SECONDS, ZERO_SECONDS);
            
            Assert.AreEqual(SOME_STRING, wait.Until(condition));
            
            mockDriver.Verify(_ => _.CurrentWindowHandle, Times.Once);
        }

        [Test]
        public void ChainsNoSuchElementExceptionWhenTimingOut()
        {
            var mockDriver = new Mock<IWebDriver>();
            var condition = GetCondition<string>(() => { throw new NoSuchElementException(); }, () => { throw new NoSuchElementException(); });

            var wait = new WebDriverWait(GetClock(), mockDriver.Object, ONE_SECONDS, ZERO_SECONDS);

            try
            {
                wait.Until(condition);
                Assert.Fail("Expected WebDriverTimeoutException to be thrown");
            }
            catch (WebDriverTimeoutException e)
            {
                Assert.IsInstanceOf(typeof (NoSuchElementException), e.InnerException);
            }
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
}
