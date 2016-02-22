using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestFramesOpen : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToOpenFrames()
        {
            selenium.Open("../tests/html/Frames.html");
            selenium.SelectFrame("mainFrame");
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_open\\.html$"));
            Assert.IsTrue(selenium.IsTextPresent("This is a test of the open command."));
            selenium.Open("../tests/html/test_page.slow.html");
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_page\\.slow\\.html$"));
            Assert.AreEqual("Slow Loading Page", selenium.GetTitle());
            selenium.SetTimeout("5000");
            selenium.Open("../tests/html/test_open.html");
            selenium.Open("../tests/html/test_open.html");
            selenium.Open("../tests/html/test_open.html");
        }
    }
}
