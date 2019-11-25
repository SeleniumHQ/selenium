using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestImplicitLocators : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToUseImplicitLocators()
        {
            selenium.Open("../tests/html/test_locators.html");
            Assert.AreEqual("this is the first element", selenium.GetText("id1"));
            Assert.AreEqual("a1", selenium.GetAttribute("id1@class"));
            Assert.AreEqual("this is the second element", selenium.GetText("name1"));
            Assert.AreEqual("a2", selenium.GetAttribute("name1@class"));
            Assert.AreEqual("this is the second element", selenium.GetText("document.links[1]"));
            Assert.AreEqual("a2", selenium.GetAttribute("document.links[1]@class"));
            Assert.AreEqual("banner", selenium.GetAttribute("//img[contains(@src, 'banner.gif')]/@alt"));
            Assert.AreEqual("this is the second element", selenium.GetText("//body/a[2]"));
        }
    }
}
