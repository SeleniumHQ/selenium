using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestClickJavascriptHref : SeleniumTestCaseBase
    {
        [Test]
        public void ClickJavascriptHref()
        {
            selenium.Open("../tests/html/test_click_javascript_page.html");
            selenium.Click("link");
            Assert.AreEqual("link clicked: foo", selenium.GetAlert());
            selenium.Click("linkWithMultipleJavascriptStatements");
            Assert.AreEqual("alert1", selenium.GetAlert());
            Assert.AreEqual("alert2", selenium.GetAlert());
            Assert.AreEqual("alert3", selenium.GetAlert());
            selenium.Click("linkWithJavascriptVoidHref");
            Assert.AreEqual("onclick", selenium.GetAlert());
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.Click("linkWithOnclickReturnsFalse");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            selenium.Click("enclosedImage");
            Assert.AreEqual("enclosedImage clicked", selenium.GetAlert());
        }
    }
}
