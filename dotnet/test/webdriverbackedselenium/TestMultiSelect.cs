using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestMultiSelect : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToMultiSelect()
        {
            selenium.Open("../tests/html/test_multiselect.html");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Second Option");
            selenium.Select("theSelect", "index=4");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Fifth Option");
            selenium.AddSelection("theSelect", "Third Option");
            selenium.AddSelection("theSelect", "value=");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Third Option,Fifth Option,Empty Value Option");
            selenium.RemoveSelection("theSelect", "id=o7");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Third Option,Fifth Option");
            selenium.RemoveSelection("theSelect", "label=Fifth Option");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Third Option"); ;
            selenium.AddSelection("theSelect", "");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Third Option,");
            selenium.RemoveSelection("theSelect", "");
            selenium.RemoveSelection("theSelect", "Third Option");
            try
            {
                Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "");
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "");
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            Assert.AreEqual(selenium.GetValue("theSelect"), "");
            Assert.IsFalse(selenium.IsSomethingSelected("theSelect"));
            selenium.AddSelection("theSelect", "Third Option");
            selenium.AddSelection("theSelect", "value=");
            selenium.RemoveAllSelections("theSelect");
            Assert.IsFalse(selenium.IsSomethingSelected("theSelect"));
        }
    }
}
