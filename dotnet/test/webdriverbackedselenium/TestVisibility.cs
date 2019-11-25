using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestVisibility : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToVerifyVisibility()
        {
            selenium.Open("../tests/html/test_visibility.html");
            Assert.IsTrue(selenium.IsVisible("visibleParagraph"));
            Assert.IsFalse(selenium.IsVisible("hiddenParagraph"));
            Assert.IsFalse(selenium.IsVisible("suppressedParagraph"));
            Assert.IsFalse(selenium.IsVisible("classSuppressedParagraph"));
            Assert.IsFalse(selenium.IsVisible("jsClassSuppressedParagraph"));
            Assert.IsFalse(selenium.IsVisible("hiddenSubElement"));
            Assert.IsTrue(selenium.IsVisible("visibleSubElement"));
            Assert.IsFalse(selenium.IsVisible("suppressedSubElement"));
            Assert.IsFalse(selenium.IsVisible("jsHiddenParagraph"));
            try
            {
                Assert.IsFalse(selenium.IsVisible("visibleParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("hiddenParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("suppressedParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("classSuppressedParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("jsClassSuppressedParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("hiddenSubElement"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("suppressedSubElement"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsVisible("jsHiddenParagraph"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            Assert.IsFalse(selenium.IsVisible("hiddenInput"));
            try
            {
                Assert.IsTrue(selenium.IsVisible("nonExistentElement"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
        }
    }
}
