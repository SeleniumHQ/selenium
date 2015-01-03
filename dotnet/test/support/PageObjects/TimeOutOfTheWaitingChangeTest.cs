using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class TimeOutOfTheWaitingChangeTest : DriverTestFixture
    {
        [FindsBy(How = How.Id, Using = "FakeID", Priority = 1)]
        private IList<IWebElement> FakeElements;
        private readonly double acceptableDeltaInMillis = 800; 

        [TestFixtureSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [TestFixtureTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }

        private double ConvertToMilliseconds(DateTime dateTime1, DateTime dateTime2)
        {
            return dateTime1.Subtract(
                dateTime2
                ).TotalMilliseconds;
        }

        [Test]
        public void TestOfTheTimeOutChanging()
        {
            DefaultLocatorFactory factory = new DefaultLocatorFactory(driver, TimeSpan.FromSeconds(5), TimeSpan.FromMilliseconds(50));
            
            PageFactory.InitElements(this, factory);
            DateTime startTime = DateTime.Now;
            int count =  FakeElements.Count;
            DateTime endTime = DateTime.Now;

            Assert.IsTrue(Math.Abs((ConvertToMilliseconds(endTime, startTime)) - TimeSpan.FromSeconds(5).TotalMilliseconds)
                <= acceptableDeltaInMillis);

            factory.WaitingTimeSpan = TimeSpan.FromMilliseconds(1800);
            startTime = DateTime.Now;
            count = FakeElements.Count;
            endTime = DateTime.Now;

            Assert.IsTrue(Math.Abs((ConvertToMilliseconds(endTime, startTime)) - TimeSpan.FromMilliseconds(1800).TotalMilliseconds)
                <= acceptableDeltaInMillis);

            startTime = DateTime.Now;
            driver.FindElements(By.Id("FakeID"));
            endTime = DateTime.Now;

            Assert.IsTrue(Math.Abs((ConvertToMilliseconds(endTime, startTime)) - TimeSpan.FromMilliseconds(1800).TotalMilliseconds)
                <= acceptableDeltaInMillis);
        }


    }
}
