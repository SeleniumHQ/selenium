using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestClick : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToClick()
        {
            selenium.Open("/html/test_click_page1.html");
            Assert.AreEqual("Click here for next page", selenium.GetText("link"));
            selenium.Click("link");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.Click("linkWithEnclosedImage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.Click("enclosedImage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.Click("extraEnclosedImage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            selenium.Click("linkToAnchorOnThisPage");
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
            selenium.Click("linkWithOnclickReturnsFalse");
            System.Threading.Thread.Sleep(300);
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.SetTimeout("5000");
            selenium.Open("/html/test_click_page1.html");
            //TODO: revisit when advanced user interactions is completed.
            //selenium.DoubleClick("doubleClickable");
            //Assert.AreEqual("double clicked!", selenium.GetAlert());
        }
    }
}
