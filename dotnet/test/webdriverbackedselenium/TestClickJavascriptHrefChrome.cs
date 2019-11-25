using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestClickJavascriptHrefChrome : SeleniumTestCaseBase
    {
        [Test]
        public void ClickJavascriptHrefChrome()
        {
            selenium.Open("../tests/html/test_click_javascript_chrome_page.html");
            selenium.Click("id=a");
            Assert.AreEqual(selenium.GetAlert(), "a");
            selenium.Click("id=b");
            Assert.AreEqual(selenium.GetAlert(), "b");
            selenium.Click("id=c");
            Assert.AreEqual(selenium.GetAlert(), "c");
            selenium.Click("id=d");
            Assert.IsFalse(selenium.IsElementPresent("id=d"));
            selenium.Click("id=e");
            Assert.AreEqual(selenium.GetAlert(), "e");
            Assert.IsFalse(selenium.IsElementPresent("id=e"));
            selenium.Click("id=f");
            selenium.WaitForPopUp("f-window", "10000");
            selenium.SelectWindow("name=f-window");
            Assert.IsTrue(selenium.IsElementPresent("id=visibleParagraph"));
            selenium.Close();
            selenium.SelectWindow("");

            // TODO(simon): re-enable this part of the test
            //		selenium.click("id=g");
            //		verifyEquals(selenium.getAlert(), "g");
            //		selenium.waitForPopUp("g-window", "10000");
            //		selenium.selectWindow("name=g-window");
            //		verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
            //		selenium.close();
            //		selenium.selectWindow("");
            selenium.Click("id=h");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual(selenium.GetAlert(), "h");
            Assert.IsTrue(selenium.IsElementPresent("id=visibleParagraph"));
        }
    }
}
