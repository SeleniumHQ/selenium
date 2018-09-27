using System;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestClickAt : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToClick()
        {
            selenium.Open("/html/test_click_page1.html");
            Assert.AreEqual("Click here for next page", selenium.GetText("link"));
            selenium.ClickAt("link", "0,0");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.ClickAt("link", "10,5");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.ClickAt("linkWithEnclosedImage", "0,0");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.ClickAt("linkWithEnclosedImage", "600,5");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.ClickAt("enclosedImage", "0,0");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            // Pixel count is 0-based, not 1-based. In addition, current implementation
            // of Utils.getLocation adds 3 pixels to the x offset. Until that's fixed,
            // do not attempt to click at the edge of the image.
            selenium.ClickAt("enclosedImage", "640,40");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.ClickAt("extraEnclosedImage", "0,0");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.ClickAt("extraEnclosedImage", "643,40");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.ClickAt("linkToAnchorOnThisPage", "0,0");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.ClickAt("linkToAnchorOnThisPage", "10,5");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            try 
            { 
                selenium.WaitForPageToLoad("500");
                Assert.Fail("expected failure"); 
            }
            catch (Exception)
            {
            }
            selenium.SetTimeout("30000");
            selenium.ClickAt("linkWithOnclickReturnsFalse", "0,0");
            System.Threading.Thread.Sleep(300);
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.ClickAt("linkWithOnclickReturnsFalse", "10,5");
            System.Threading.Thread.Sleep(300);
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.SetTimeout("5000");

            if (IsUsingNativeEvents())
            {
                // Click outside the element and make sure we don't pass to the next page.
                selenium.ClickAt("linkWithEnclosedImage", "650,0");
                selenium.WaitForPageToLoad("30000");
                Assert.AreEqual("Click Page 1", selenium.GetTitle());
                selenium.ClickAt("linkWithEnclosedImage", "660,20");
                selenium.WaitForPageToLoad("30000");
                Assert.AreEqual("Click Page 1", selenium.GetTitle());
                selenium.SetTimeout("5000");
            }
        }

        private Boolean IsUsingNativeEvents() {
            if (!(selenium is WebDriverBackedSelenium)) {
                return false;
            }

            IWebDriver driver = ((WebDriverBackedSelenium) selenium).UnderlyingWebDriver;
            if (!(driver is IHasCapabilities)) {
                return false;
            }

            ICapabilities capabilities = ((IHasCapabilities) driver).Capabilities;
            return capabilities.HasCapability(CapabilityType.HasNativeEvents);
        }
    }
}
