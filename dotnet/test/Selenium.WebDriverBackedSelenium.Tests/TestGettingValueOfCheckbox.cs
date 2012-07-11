using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestGettingValueOfCheckbox : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToHandleFunkyEventHandling()
        {
            selenium.Open("../tests/html/test_submit.html");

            string elementLocator = "name=okayToSubmit";
            Assert.AreEqual("off", selenium.GetValue(elementLocator));

            selenium.Click(elementLocator);
            Assert.AreEqual("on", selenium.GetValue(elementLocator));

            selenium.Click(elementLocator);
            Assert.AreEqual("off", selenium.GetValue(elementLocator));
        }
    }
}
