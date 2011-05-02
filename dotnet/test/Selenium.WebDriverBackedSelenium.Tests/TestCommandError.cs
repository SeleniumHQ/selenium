using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestCommandError : SeleniumTestCaseBase
    {
        [Test]
        public void CommandError()
        {
            selenium.Open("../tests/html/test_verifications.html");
            try
            {
                selenium.Click("notALink"); Assert.Fail("expected failure");
            }
            catch (Exception) { }

            try
            {
                selenium.Select("noSuchSelect", "somelabel"); Assert.Fail("expected failure");
            }
            catch (Exception) { }

            try
            {
                selenium.Select("theSelect", "label=noSuchLabel"); Assert.Fail("expected failure");
            }
            catch (Exception) { }

            try
            {
                selenium.Select("theText", "label=noSuchLabel"); Assert.Fail("expected failure");
            }
            catch (Exception) { }
        }
    }
}
