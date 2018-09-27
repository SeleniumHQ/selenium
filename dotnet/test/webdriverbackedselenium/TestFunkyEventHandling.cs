using NUnit.Framework;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestFunkyEventHandling : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToHandleFunkyEventHandling()
        {
            selenium.Open("../tests/html/test_funky_event_handling.html");
            selenium.Click("clickMe");
            Thread.Sleep(1000);
            Assert.IsFalse(selenium.IsTextPresent("You shouldn't be here!"));
        }
    }
}
