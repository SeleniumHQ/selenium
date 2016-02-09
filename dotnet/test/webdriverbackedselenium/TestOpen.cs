using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestOpen : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToOpen()
        {
            selenium.Open("../tests/html/test_open.html");
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_open\\.html$"));
            // Should really split these verifications into their own test file.
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), ".*/tests/html/[Tt]est_open.html"));
            Assert.IsFalse(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/foo\\.html$"));
            Assert.IsTrue(selenium.IsTextPresent("glob:This is a test of the open command."));
            Assert.IsTrue(selenium.IsTextPresent("This is a test of the open command."));
            Assert.IsTrue(selenium.IsTextPresent("exact:This is a test of"));
            Assert.IsTrue(selenium.IsTextPresent("regexp:This is a test of"));
            Assert.IsTrue(selenium.IsTextPresent("regexp:T*his is a test of"));
            Assert.IsFalse(selenium.IsTextPresent("exact:XXXXThis is a test of"));
            Assert.IsFalse(selenium.IsTextPresent("regexp:ThXXXXXXXXXis is a test of"));
            selenium.Open("../tests/html/test_page.slow.html");
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_page\\.slow\\.html$"));
            Assert.AreEqual(selenium.GetTitle(), "Slow Loading Page");
            selenium.SetTimeout("5000");
            selenium.Open("../tests/html/test_open.html");
            selenium.Open("../tests/html/test_open.html");
            selenium.Open("../tests/html/test_open.html");
        }
    }
}
