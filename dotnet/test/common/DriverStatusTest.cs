using NUnit.Framework;
using OpenQA.Selenium.Chrome;
using System;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DriverStatusTest
    {

        [Test]
        public void ShouldGetStatus()
        {
            Assert.Throws<System.Net.Http.HttpRequestException>(() => ChromeDriver.GetStatus(new Uri("http://localhost:6000")));
        }
    }

}
