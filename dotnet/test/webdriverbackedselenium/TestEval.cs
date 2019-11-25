using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestEval : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldAllowEval()
        {
            selenium.Open("../tests/html/test_open.html");
            Assert.AreEqual(selenium.GetEval("window.document.title"), "Open Test");
        }
    }
}
