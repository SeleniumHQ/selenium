using NUnit.Framework;

namespace OpenQA.Selenium.Html5
{
    [TestFixture]
    public class LocationContextTest : DriverTestFixture
    {
        //[Test]
        [IgnoreBrowser(Browser.EdgeLegacy, "Driver incorrectly reports location capability")]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of geolocation.")]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver does not support setting altitude value.")]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support setting altitude value.")]
        public void ShouldSetAndGetLocation()
        {
            driver.Url = html5Page;
            IHasLocationContext hasLocationContextDriver = driver as IHasLocationContext;
            if (hasLocationContextDriver == null || !hasLocationContextDriver.HasLocationContext)
            {
                Assert.Ignore("Driver does not support location context");
            }

            hasLocationContextDriver.LocationContext.PhysicalLocation = new Location(40.714353, -74.005973, 0.056747);

            Location location = hasLocationContextDriver.LocationContext.PhysicalLocation;
            Assert.That(location, Is.Not.Null, "Failed to get location context handle");

            Assert.AreEqual(40.714353, location.Latitude, "Latitudes do not match");
            Assert.AreEqual(-74.005973, location.Longitude, "Longitudes do not match");
            Assert.AreEqual(0.056747, location.Altitude, "Altitudes do not match");
        }
    }
}
