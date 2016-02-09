using System;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestWaitForNot : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToWaitForNot()
        {
            selenium.Open("../tests/html/test_async_event.html");
            Assert.AreEqual(selenium.GetValue("theField"), "oldValue");
            selenium.Click("theButton");
            Assert.AreEqual(selenium.GetValue("theField"), "oldValue");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (!Regex.IsMatch(selenium.GetValue("theField"), "oldValu[aei]"))
                    {
                        break;
                    }
                }
                catch (Exception)
                {
                }
                Thread.Sleep(1000);
            }

            Assert.AreEqual(selenium.GetValue("theField"), "newValue");
            Assert.AreEqual(selenium.GetText("theSpan"), "Some text");
            selenium.Click("theSpanButton");
            Assert.AreEqual(selenium.GetText("theSpan"), "Some text");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (!Regex.IsMatch(selenium.GetText("theSpan"), "Some te[xyz]t"))
                    {
                        break;
                    }
                }
                catch (Exception)
                {
                }
                Thread.Sleep(1000);
            }

            Assert.AreEqual(selenium.GetText("theSpan"), "Some new text");
        }
    }
}
