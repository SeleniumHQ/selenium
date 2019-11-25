using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestWait : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToWait()
        {
            // Link click
            selenium.Open("../tests/html/test_reload_onchange_page.html");
            selenium.Click("theLink");
            selenium.WaitForPageToLoad("30000");
            // Page should reload
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            selenium.Open("../tests/html/test_reload_onchange_page.html");
            selenium.Select("theSelect", "Second Option");
            selenium.WaitForPageToLoad("30000");
            // Page should reload
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            // Textbox with onblur
            selenium.Open("../tests/html/test_reload_onchange_page.html");
            selenium.Type("theTextbox", "new value");
            selenium.FireEvent("theTextbox", "blur");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            // Submit button
            selenium.Open("../tests/html/test_reload_onchange_page.html");
            selenium.Click("theSubmit");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            selenium.Click("slowPage_reload");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
        }
    }
}
