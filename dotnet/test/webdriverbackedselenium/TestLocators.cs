using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestLocators : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToUseLocators()
        {
            selenium.Open("../tests/html/test_locators.html");
            // Id location
            Assert.AreEqual(selenium.GetText("id=id1"), "this is the first element");
            Assert.IsFalse(selenium.IsElementPresent("id=name1"));
            Assert.IsFalse(selenium.IsElementPresent("id=id4"));
            Assert.AreEqual(selenium.GetAttribute("id=id1@class"), "a1");
            // name location
            Assert.AreEqual(selenium.GetText("name=name1"), "this is the second element");
            Assert.IsFalse(selenium.IsElementPresent("name=id1"));
            Assert.IsFalse(selenium.IsElementPresent("name=notAName"));
            Assert.AreEqual(selenium.GetAttribute("name=name1@class"), "a2");
            // class location
            Assert.AreEqual(selenium.GetText("class=a3"), "this is the third element");
            // alt location
            Assert.IsTrue(selenium.IsElementPresent("alt=banner"));
            // identifier location
            Assert.AreEqual(selenium.GetText("identifier=id1"), "this is the first element");
            Assert.IsFalse(selenium.IsElementPresent("identifier=id4"));
            Assert.AreEqual(selenium.GetAttribute("identifier=id1@class"), "a1");
            Assert.AreEqual(selenium.GetText("identifier=name1"), "this is the second element");
            Assert.AreEqual(selenium.GetAttribute("identifier=name1@class"), "a2");
            // DOM Traversal location
            Assert.AreEqual(selenium.GetText("dom=document.links[1]"), "this is the second element");
            Assert.AreEqual(selenium.GetText("dom=function foo() {return document.links[1];}; foo();"),
                "this is the second element");
            Assert.AreEqual(selenium.GetText("dom=function foo() {\nreturn document.links[1];};\nfoo();"),
                "this is the second element");
            Assert.AreEqual(selenium.GetAttribute("dom=document.links[1]@class"), "a2");
            Assert.IsFalse(selenium.IsElementPresent("dom=document.links[9]"));
            Assert.IsFalse(selenium.IsElementPresent("dom=foo"));
            // Link location
            Assert.IsTrue(selenium.IsElementPresent("link=this is the second element"));
            Assert.IsTrue(selenium.IsTextPresent("this is the second element"));
            Assert.IsTrue(selenium.IsElementPresent("link=this * second element"));
            Assert.IsTrue(selenium.IsElementPresent("link=regexp:this [aeiou]s the second element"));
            Assert.AreEqual(selenium.GetAttribute("link=this is the second element@class"), "a2");
            Assert.IsFalse(selenium.IsElementPresent("link=this is not an element"));
            // SEL-484: IE: Can't select element by ID when there's another earlier element whose "name"
            // matches the ID
            Assert.IsTrue(selenium.IsElementPresent("name=foobar"));
            Assert.IsTrue(selenium.IsElementPresent("id=foobar"));
            // SEL-608:
            // "ID selector does not work when an element on the page has a name parameter equal to id"
            Assert.IsTrue(selenium.IsElementPresent("id=myForm"));
        }
    }
}
