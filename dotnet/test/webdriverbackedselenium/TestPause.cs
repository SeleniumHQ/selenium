using NUnit.Framework;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestPause : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToPause()
        {
            selenium.Open("../tests/html/test_reload_onchange_page.html");
            // Make sure we can pause even when the page doesn't change
            Thread.Sleep(100);
            Assert.AreEqual(selenium.GetTitle(), "Reload Page");
            Assert.IsTrue(selenium.IsElementPresent("theSelect"));
            selenium.Select("theSelect", "Second Option");
            // Make sure we can pause to wait for a page reload
            // Must pause longer than the slow-loading page takes (500ms)
            Thread.Sleep(5000);
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            Assert.IsFalse(selenium.IsElementPresent("theSelect"));
            Assert.IsTrue(selenium.IsElementPresent("theSpan"));
        }
    }
}
