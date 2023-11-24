using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ChildrenFindingTest : DriverTestFixture
    {
        [Test]
        public void FindElementByXPath()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            IWebElement child = element.FindElement(By.XPath("select"));
            Assert.AreEqual("2", child.GetAttribute("id"));
        }

        [Test]
        public void FindingElementsOnElementByXPathShouldFindTopLevelElements()
        {
            driver.Url = simpleTestPage;
            IWebElement parent = driver.FindElement(By.Id("multiline"));
            ReadOnlyCollection<IWebElement> allParaElements = driver.FindElements(By.XPath("//p"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("//p"));
            Assert.AreEqual(allParaElements.Count, children.Count);
        }

        [Test]
        public void FindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements()
        {
            driver.Url = simpleTestPage;
            IWebElement parent = driver.FindElement(By.Id("multiline"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("./p"));
            Assert.AreEqual(1, children.Count);
            Assert.AreEqual("A div containing", children[0].Text);
        }

        [Test]
        public void FindElementByXPathWhenNoMatch()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            Assert.That(() => element.FindElement(By.XPath("select/x")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindElementsByXPath()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = element.FindElements(By.XPath("select/option"));
            Assert.AreEqual(8, children.Count);
            Assert.AreEqual("One", children[0].Text);
            Assert.AreEqual("Two", children[1].Text);
        }

        [Test]
        public void FindElementsByXPathWhenNoMatch()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = element.FindElements(By.XPath("select/x"));
            Assert.AreEqual(0, children.Count);
        }

        [Test]
        public void FindElementByName()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            IWebElement child = element.FindElement(By.Name("selectomatic"));
            Assert.AreEqual("2", child.GetAttribute("id"));
        }

        [Test]
        public void FindElementsByName()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = element.FindElements(By.Name("selectomatic"));
            Assert.AreEqual(children.Count, 2);
        }

        [Test]
        public void FindElementById()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            IWebElement child = element.FindElement(By.Id("2"));
            Assert.AreEqual(child.GetAttribute("name"), "selectomatic");
        }


        [Test]
        public void FindElementByIdWhenMultipleMatchesExist()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = element.FindElement(By.Id("test_id"));
            Assert.AreEqual(child.Text, "inside");
        }

        [Test]
        public void FindElementByIdWhenIdContainsNonAlphanumericCharacters()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("test_special_chars"));
            IWebElement childWithSpaces = element.FindElement(By.Id("white space"));
            Assert.That(childWithSpaces.Text.Contains("space"));
            IWebElement childWithCssChars = element.FindElement(By.Id("css#.chars"));
            Assert.That(childWithCssChars.Text, Is.EqualTo("css escapes"));
        }

        [Test]
        public void FindElementByIdWhenNoMatchInContext()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("test_id_div"));
            Assert.That(() => element.FindElement(By.Id("test_id_out")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindElementsById()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = element.FindElements(By.Id("2"));
            Assert.AreEqual(children.Count, 2);
        }

        [Test]
        public void FindElementsByIdWithNonAlphanumericCharacters()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("test_special_chars"));
            ReadOnlyCollection<IWebElement> children = element.FindElements(By.Id("white space"));
            Assert.That(children.Count, Is.EqualTo(1));
            ReadOnlyCollection<IWebElement> children2 = element.FindElements(By.Id("css#.chars"));
            Assert.That(children2.Count, Is.EqualTo(1));
        }

        [Test]
        public void FindElementByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("div1"));
            IWebElement child = element.FindElement(By.LinkText("hello world"));
            Assert.AreEqual(child.GetAttribute("name"), "link1");
        }


        [Test]
        public void FindElementsByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("div1"));
            ReadOnlyCollection<IWebElement> elements = element.FindElements(By.LinkText("hello world"));

            Assert.AreEqual(2, elements.Count);
            Assert.AreEqual(elements[0].GetAttribute("name"), "link1");
            Assert.AreEqual(elements[1].GetAttribute("name"), "link2");
        }

        [Test]
        public void ShouldFindChildElementsById()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement element = parent.FindElement(By.Id("test_id"));
            Assert.AreEqual("inside", element.Text);
        }

        [Test]
        public void ShouldNotReturnRootElementWhenFindingChildrenById()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id"));

            Assert.AreEqual(0, parent.FindElements(By.Id("test_id")).Count);
            Assert.That(() => parent.FindElement(By.Id("test_id")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldFindChildElementsByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));

            IWebElement element = parent.FindElement(By.ClassName("one"));

            Assert.AreEqual("Find me", element.Text);
        }

        [Test]
        public void ShouldFindChildrenByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));

            ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.ClassName("one"));

            Assert.AreEqual(2, elements.Count);
        }


        [Test]
        public void ShouldFindChildElementsByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));

            IWebElement element = parent.FindElement(By.TagName("a"));

            Assert.AreEqual("link1", element.GetAttribute("name"));
        }


        [Test]
        public void ShouldFindChildrenByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));

            ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.TagName("a"));

            Assert.AreEqual(2, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByCssSelector()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));

            IWebElement element = parent.FindElement(By.CssSelector("*[name=\"selectomatic\"]"));

            Assert.AreEqual("2", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByCss3Selector()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));

            IWebElement element = parent.FindElement(By.CssSelector("*[name^=\"selecto\"]"));

            Assert.AreEqual("2", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldBeAbleToFindElementsByCssSelector()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));

            ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.CssSelector("*[name=\"selectomatic\"]"));

            Assert.AreEqual(2, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindChildrenOfANode()
        {
            driver.Url = selectableItemsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("/html/head"));
            IWebElement head = elements[0];
            ReadOnlyCollection<IWebElement> importedScripts = head.FindElements(By.TagName("script"));
            Assert.That(importedScripts.Count, Is.EqualTo(3));
        }

        [Test]
        public void ReturnAnEmptyListWhenThereAreNoChildrenOfANode()
        {
            driver.Url = xhtmlTestPage;
            IWebElement table = driver.FindElement(By.Id("table"));
            ReadOnlyCollection<IWebElement> rows = table.FindElements(By.TagName("tr"));

            Assert.That(rows.Count, Is.EqualTo(0));
        }

        [Test]
        public void ShouldFindGrandChildren()
        {
            driver.Url = formsPage;
            IWebElement form = driver.FindElement(By.Id("nested_form"));
            form.FindElement(By.Name("x"));
        }

        [Test]
        public void ShouldNotFindElementOutSideTree()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Name("login"));
            Assert.That(() => element.FindElement(By.Name("x")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingByTagNameShouldNotIncludeParentElementIfSameTagType()
        {
            driver.Url = xhtmlTestPage;
            IWebElement parent = driver.FindElement(By.Id("my_span"));

            Assert.AreEqual(2, parent.FindElements(By.TagName("div")).Count);
            Assert.AreEqual(2, parent.FindElements(By.TagName("span")).Count);
        }

        [Test]
        public void FindingByCssShouldNotIncludeParentElementIfSameTagType()
        {
            driver.Url = xhtmlTestPage;
            IWebElement parent = driver.FindElement(By.CssSelector("div#parent"));
            IWebElement child = parent.FindElement(By.CssSelector("div"));

            Assert.AreEqual("child", child.GetAttribute("id"));
        }

        [Test]
        public void FindMultipleElements()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            ReadOnlyCollection<IWebElement> elements = elem.FindElements(By.PartialLinkText("link"));
            Assert.That(elements, Is.Not.Null);
            Assert.AreEqual(6, elements.Count);
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Safari does not trim")]
        public void LinkWithLeadingSpaces()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with leading space"));
            Assert.AreEqual("link with leading space", res.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Safari does not trim")]
        public void LinkWithTrailingSpace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with trailing space"));
            Assert.AreEqual("link with trailing space", res.Text);
        }

        [Test]
        public void ElementCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement link = elem.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
        }
    }
}
