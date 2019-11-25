using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestSelect : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToSelect()
        {
            selenium.Open("../tests/html/test_select.html");
            Assert.IsTrue(selenium.IsSomethingSelected("theSelect"));
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Second Option"); ;
            selenium.Select("theSelect", "index=4");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Fifth Option");
            Assert.AreEqual(selenium.GetSelectedIndex("theSelect"), "4");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Fifth Option");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "Fifth Option");
            selenium.Select("theSelect", "Third Option");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Third Option"); ;
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Third Option"); ;
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Third Option");
            selenium.Select("theSelect", "label=Fourth Option");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Fourth Option");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Fourth Option"); ;
            selenium.Select("theSelect", "value=option6");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Sixth Option");
            Assert.AreEqual(selenium.GetSelectedValue("theSelect"), "option6");
            Assert.AreEqual(selenium.GetSelectedValue("theSelect"), "option6"); ;
            selenium.Select("theSelect", "value=");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Empty Value Option");
            selenium.Select("theSelect", "id=o4");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "Fourth Option");
            Assert.AreEqual(selenium.GetSelectedId("theSelect"), "o4");
            selenium.Select("theSelect", "");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "");
            Assert.AreEqual(string.Join(",", selenium.GetSelectedLabels("theSelect")), "");
            try
            {
                selenium.Select("theSelect", "Not an option");
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                selenium.AddSelection("theSelect", "Fourth Option");
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            try
            {
                selenium.RemoveSelection("theSelect", "Fourth Option");
                Assert.Fail("expected failure");
            }
            catch (Exception)
            {
            }
            Assert.AreEqual(string.Join(",", selenium.GetSelectOptions("theSelect")),
                "First Option,Second Option,Third Option,Fourth Option,Fifth Option,Sixth Option,Empty Value Option,");
        }
    }
}
