using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class LogTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToGetTheAvailableLogTypes()
        {
            var logs = driver.Manage().Logs.AvailableLogTypes;
            Assert.IsNotNull(logs);
        }
    }
}