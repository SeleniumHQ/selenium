using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestPatternMatching : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToMatchPatterns()
        {
            selenium.Open("../tests/html/test_verifications.html");
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theText"), "^[\\s\\S]*text[\\s\\S]*$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theHidden"), "^[\\s\\S]* hidden value$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetText("theSpan"), "^[\\s\\S]* span$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetSelectedLabel("theSelect"), "^second [\\s\\S]*$")); ;
            Assert.IsTrue(Regex.IsMatch(string.Join(",", selenium.GetSelectOptions("theSelect")), "^first[\\s\\S]*,second[\\s\\S]*,third[\\s\\S]*$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetAttribute("theText@class"), "^[\\s\\S]oo$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theTextarea"), "^Line 1[\\s\\S]*$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theText"), "^[a-z ]+$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theHidden"), "dd"));
            Assert.IsFalse(Regex.IsMatch(selenium.GetValue("theHidden"), "DD"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theHidden"), "DD", RegexOptions.IgnoreCase));
            Assert.IsTrue(Regex.IsMatch(selenium.GetText("theSpan"), "span$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetSelectedLabel("theSelect"), "second .*"));;
            Assert.IsTrue(Regex.IsMatch(selenium.GetAttribute("theText@class"), "^f"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theText"), "^[a-z ]+$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetValue("theHidden"), "dd"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetText("theSpan"), "span$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetSelectedLabel("theSelect"), "second .*"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetAttribute("theText@class"), "^f"));
            Assert.AreEqual(selenium.GetValue("theText"), "the text value");
            Assert.AreEqual(selenium.GetSelectedLabel("theSelect"), "second option"); ;
            Assert.IsTrue(Regex.IsMatch(string.Join(",", selenium.GetSelectOptions("theSelect")), "^first.*?,second option,third*"));
        }
    }
}
