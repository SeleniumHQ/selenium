using NUnit.Framework;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestOpenInTargetFrame : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToOpenInTargetFrame()
        {
            selenium.Open("../tests/html/test_open_in_target_frame.html");
            selenium.SelectFrame("rightFrame");
            selenium.Click("link=Show new frame in leftFrame");
            // we are forced to do a pause instead of clickandwait here,
            // for currently we can not detect target frame loading in ie yet
            Thread.Sleep(1500);
            Assert.IsTrue(selenium.IsTextPresent("Show new frame in leftFrame"));
            selenium.SelectFrame("relative=top");
            selenium.SelectFrame("leftFrame");
            Assert.IsTrue(selenium.IsTextPresent("content loaded"));
            Assert.IsFalse(selenium.IsTextPresent("This is frame LEFT"));
        }
    }
}
