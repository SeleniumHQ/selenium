using System;
using NUnit.Framework;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.HTML5
{
    [TestFixture]
    public class LocationContextTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void ShouldSetAndGetLocation()
        {
            driver.Url = simpleTestPage;
            ((RemoteWebDriver)driver).LocationContext.SetLocation(new Location(40.714353, -74.005973, 0.056747));
            
            Location location = ((RemoteWebDriver)driver).LocationContext.Location();
            Assert.IsNotNull(location, "Failed to get location context handle");

            Assert.AreEqual(40.714353, location.GetLatitude());
            Assert.AreEqual(-74.005973, location.GetLongitude());
            Assert.AreEqual(0.056747, location.GetAltitude());
        }
    }
}
