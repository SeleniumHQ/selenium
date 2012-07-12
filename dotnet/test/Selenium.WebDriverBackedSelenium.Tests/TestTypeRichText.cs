using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Threading;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestTypeRichText : SeleniumTestCaseBase
    {
        [Ignore("GetEval of browserVersion fails.")]
        public void ShouldBeAbleToTypeInRichText()
        {
            String isIe = selenium.GetEval("browserVersion.isIE");
            if (bool.Parse(isIe))
            {
                return;
            }

            selenium.Open("../tests/html/test_rich_text.html");
            selenium.SelectFrame("richtext");
            Assert.AreEqual(selenium.GetText("//body"), "");
            selenium.Type("//body", "hello world");
            Assert.AreEqual(selenium.GetText("//body"), "hello world");
        }

        [TearDown]
        public void resetFrame()
        {
            selenium.SelectFrame("relative=top");
        }
    }
}
