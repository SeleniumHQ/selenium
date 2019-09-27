using System;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SlowLoadingPageTest : DriverTestFixture
    {
        private const long LoadTimeInSeconds = 3;

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldBlockUntilPageLoads()
        {
            DateTime start = DateTime.Now;
            driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
            DateTime now = DateTime.Now;
            double elapsedTime = now.Subtract(start).TotalSeconds;
            Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldBlockUntilIFramesAreLoaded()
        {
            DateTime start = DateTime.Now;
            driver.Url = slowIframes;
            DateTime now = DateTime.Now;
            double elapsedTime = now.Subtract(start).TotalSeconds;
            Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void RefreshShouldBlockUntilPageLoads()
        {
            DateTime start = DateTime.Now;
            driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
            DateTime now = DateTime.Now;
            double elapsedTime = now.Subtract(start).TotalSeconds;
            Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
            start = DateTime.Now;
            driver.Navigate().Refresh();
            now = DateTime.Now;
            elapsedTime = now.Subtract(start).TotalSeconds;
            Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
        }
    }
}
