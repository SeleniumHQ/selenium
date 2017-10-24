using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestHtmlSource : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToGetHtmlSource()
        {
            selenium.Open("../tests/html/test_html_source.html");
            Assert.IsTrue(Regex.IsMatch(selenium.GetHtmlSource(), "^[\\s\\S]*Text is here[\\s\\S]*$"));
            Assert.IsFalse(Regex.IsMatch(selenium.GetHtmlSource(), "^[\\s\\S]*can not be found[\\s\\S]*$"));
        }
    }
}
