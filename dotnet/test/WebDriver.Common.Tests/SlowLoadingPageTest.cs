using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SlowLoadingPageTest : DriverTestFixture
    {
        private const long LoadTimeInSeconds = 3;

        [Test]
        [NeedsFreshDriver(BeforeTest = true)]
        public void ShouldBlockUntilPageLoads()
        {
            DateTime start = DateTime.Now;
            driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
            DateTime now = DateTime.Now;
            Assert.LessOrEqual(LoadTimeInSeconds, now.Subtract(start).TotalSeconds);
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true)]
        public void ShouldBlockUntilIFramesAreLoaded()
        {
            DateTime start = DateTime.Now;
            driver.Url = slowIframes;
            DateTime now = DateTime.Now;
            Assert.LessOrEqual(LoadTimeInSeconds, now.Subtract(start).TotalSeconds);
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true)]
        [IgnoreBrowser(Browser.Chrome, "Chrome may refresh to within 10 milliseconds")]
        public void RefreshShouldBlockUntilPageLoads()
        {
            DateTime start = DateTime.Now;
            driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
            DateTime now = DateTime.Now;
            Assert.LessOrEqual(LoadTimeInSeconds, now.Subtract(start).TotalSeconds);
            start = DateTime.Now;
            driver.Navigate().Refresh();
            now = DateTime.Now;
            Assert.LessOrEqual(LoadTimeInSeconds, now.Subtract(start).TotalSeconds);
        }
    }
}
