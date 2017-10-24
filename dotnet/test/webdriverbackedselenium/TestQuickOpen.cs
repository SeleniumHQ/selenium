using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestQuickOpen : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToQuickOpen()
        {
            // <tr>
            // <td>setTimeout</td>
            // <td>5000</td>
            // <td>&nbsp;</td>
            // </tr>
            selenium.Open("../tests/html/test_open.html");
            selenium.Open("../tests/html/test_page.slow.html");
            Assert.IsTrue(selenium.IsTextPresent("This is a slow-loading page"));
        }
    }
}
