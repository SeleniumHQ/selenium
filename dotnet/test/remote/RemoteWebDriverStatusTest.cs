using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Remote
{
    [TestFixture]
    public class RemoteWebDriverStatusTest
    {
        [SetUp]
        public void Setup()
        {
            EnvironmentManager.Instance.RemoteServer.Start();
        }

        [TearDown]
        public void Teardown()
        {
            EnvironmentManager.Instance.RemoteServer.Stop();
        }

        [Test]
        public void ShouldBeAbleToGetStatus()
        {
            Status status = RemoteWebDriver.GetStatus(new Uri("http://localhost:6000"));
            Assert.IsTrue(status.Ready);
            Assert.AreEqual("Selenium Grid ready.", status.Message);
        }
    }
}
