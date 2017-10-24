using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestGoBack : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToGoBack()
        {
            selenium.Open("../tests/html/test_click_page1.html");
            Assert.AreEqual("Click Page 1", selenium.GetTitle(), "Click Page 1");
            // Click a regular link
            selenium.Click("link");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page Target", selenium.GetTitle());
            selenium.GoBack();
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Click Page 1", selenium.GetTitle());
            // history.forward() generates 'Permission Denied' in IE
            // <tr>
            // <td>goForward</td>
            // <td>&nbsp;</td>
            // <td>&nbsp;</td>
            // </tr>
            // <tr>
            // <td>verifyTitle</td>
            // <td>Click Page Target</td>
            // <td>&nbsp;</td>
            // </tr>
            //
        }
    }
}
