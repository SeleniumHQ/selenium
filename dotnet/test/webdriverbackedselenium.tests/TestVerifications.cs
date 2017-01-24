using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestVerifications : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToVerify()
        {
            selenium.Open("../tests/html/test_verifications.html?foo=bar");
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_verifications\\.html[\\s\\S]*$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetLocation(), "^[\\s\\S]*/tests/html/test_verifications\\.html[\\s\\S]foo=bar$"));
            Assert.AreEqual(selenium.GetValue("theText"), "the text value");
            Assert.AreNotEqual("not the text value", selenium.GetValue("theText"));
            Assert.AreEqual(selenium.GetValue("theHidden"), "the hidden value");
            Assert.AreEqual(selenium.GetText("theSpan"), "this is the span");
            Assert.AreNotEqual("blah blah", selenium.GetText("theSpan"));
            Assert.IsTrue(selenium.IsTextPresent("this is the span"));
            Assert.IsFalse(selenium.IsTextPresent("this is not the span"));
            Assert.IsTrue(selenium.IsElementPresent("theSpan"));
            Assert.IsTrue(selenium.IsElementPresent("theText"));
            Assert.IsFalse(selenium.IsElementPresent("unknown"));
            Assert.AreEqual(selenium.GetTable("theTable.0.0"), "th1");
            Assert.AreEqual(selenium.GetTable("theTable.1.0"), "a");
            Assert.AreEqual(selenium.GetTable("theTable.2.1"), "d");
            Assert.AreEqual(selenium.GetTable("theTable.3.1"), "f2");
            Assert.AreEqual(selenium.GetSelectedIndex("theSelect"), "1"); ;
            Assert.AreEqual(selenium.GetSelectedValue("theSelect"), "option2"); ;
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "second option"); ;
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "second option"); ;
            Assert.AreEqual(selenium.GetSelectedId("theSelect"), "o2"); ;
            Assert.AreEqual(string.Join(",", selenium.GetSelectOptions("theSelect")), "first option,second option,third,,option");
            Assert.AreEqual(selenium.GetAttribute("theText@class"), "foo");
            Assert.AreNotEqual("fox", selenium.GetAttribute("theText@class"));
            Assert.AreEqual(selenium.GetTitle(), "theTitle");
            Assert.AreNotEqual("Blah Blah", selenium.GetTitle());
        }
    }
}
