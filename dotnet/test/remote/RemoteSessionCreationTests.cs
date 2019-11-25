using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Remote
{
    [TestFixture]
    public class RemoteSessionCreationTests : DriverTestFixture
    {
        [Test]
        public void CreateChromeRemoteSession()
        {
            IWebDriver chrome = new ChromeRemoteWebDriver();
            chrome.Url = xhtmlTestPage;
            try
            {
                Assert.AreEqual("XHTML Test Page", chrome.Title);
            }
            finally
            {
                chrome.Quit();
            }
        }

        [Test]
        public void CreateFirefoxRemoteSession()
        {
            IWebDriver firefox = new FirefoxRemoteWebDriver();
            firefox.Url = xhtmlTestPage;
            try
            {
                Assert.AreEqual("XHTML Test Page", firefox.Title);
            }
            finally
            {
                firefox.Quit();
            }
        }

        [Test]
        public void CreateEdgeRemoteSession()
        {
            IWebDriver edge = new EdgeRemoteWebDriver();
            edge.Url = xhtmlTestPage;
            try
            {
                Assert.AreEqual("XHTML Test Page", edge.Title);
            }
            finally
            {
                edge.Quit();
            }
        }
    }
}
