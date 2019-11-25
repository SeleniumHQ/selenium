using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestEditable : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldDetectEditable()
        {
            selenium.Open("/html/test_editable.html");
            Assert.IsTrue(selenium.IsEditable("normal_text"));
            Assert.IsTrue(selenium.IsEditable("normal_select"));
            Assert.IsFalse(selenium.IsEditable("disabled_text"));
            Assert.IsFalse(selenium.IsEditable("disabled_select"));
            Assert.IsFalse(selenium.IsEditable("readonly_text"));
            try
            {
                Assert.IsFalse(selenium.IsEditable("normal_text"));
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsFalse(selenium.IsEditable("normal_select"));
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsEditable("disabled_text"));
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsEditable("disabled_select"));
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsEditable("fake_input"));
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
        }
    }
}