using NUnit.Framework;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestFramesClick : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToClickInFrames()
        {
            selenium.Open("../tests/html/Frames.html");
            selenium.SelectFrame("mainFrame");
            selenium.Open("../tests/html/test_click_page1.html");
            // Click a regular link
            Assert.AreEqual("Click here for next page", selenium.GetText("link"));
            selenium.Click("link");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            // Click a link with an enclosed image
            selenium.Click("linkWithEnclosedImage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            // Click an image enclosed by a link
            selenium.Click("enclosedImage");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.Click("previousPage");
            selenium.WaitForPageToLoad("30000");
            // Click a link with an href anchor target within this page
            selenium.Click("linkToAnchorOnThisPage");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            // Click a link where onclick returns false
            selenium.Click("linkWithOnclickReturnsFalse");
            // Need a pause to give the page a chance to reload (so this test can fail)
            Thread.Sleep(300);
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.SetTimeout("5000");
            selenium.Open("../tests/html/test_click_page1.html");
            // TODO Click a link with a target attribute
        }
    }
}
