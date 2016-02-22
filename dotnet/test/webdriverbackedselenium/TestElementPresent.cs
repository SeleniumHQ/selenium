using System;
using NUnit.Framework;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestElementPresent : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldDetectElementPresent()
        {
            selenium.Open("../tests/html/test_element_present.html");
            Assert.IsTrue(selenium.IsElementPresent("aLink"));
            selenium.Click("removeLinkAfterAWhile");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try { if (!selenium.IsElementPresent("aLink")) break; }
                catch (Exception) { }
                Thread.Sleep(1000);
            }

            Assert.IsFalse(selenium.IsElementPresent("aLink"));
            selenium.Click("addLinkAfterAWhile");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try { if (selenium.IsElementPresent("aLink")) break; }
                catch (Exception) { }
                Thread.Sleep(1000);
            }

            Assert.IsTrue(selenium.IsElementPresent("aLink"));
        }
    }
}
