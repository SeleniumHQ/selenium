using System;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementFindingTest : DriverTestFixture
    {
        // By.id positive

        [Test]
        public void ShouldBeAbleToFindASingleElementById()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.Id("linkId"));
            Assert.AreEqual("linkId", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldBeAbleToFindASingleElementByNumericId()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("2"));
            Assert.That(element.GetAttribute("id"), Is.EqualTo("2"));
        }

        [Test]
        public void ShouldBeAbleToFindASingleElementByIdWithNonAlphanumericCharacters()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Id("white space"));
            Assert.That(element.Text, Is.EqualTo("space"));
            IWebElement element2 = driver.FindElement(By.Id("css#.chars"));
            Assert.That(element2.Text, Is.EqualTo("css escapes"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsById()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("2"));
            Assert.AreEqual(8, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByNumericId()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("2"));
            Assert.That(elements.Count, Is.EqualTo(8));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByIdWithNonAlphanumericCharacters()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("white space"));
            Assert.That(elements.Count, Is.EqualTo(2));
            ReadOnlyCollection<IWebElement> elements2 = driver.FindElements(By.Id("css#.chars"));
            Assert.That(elements2.Count, Is.EqualTo(2));
        }

        // By.id negative

        [Test]
        public void ShouldNotBeAbleToLocateByIdASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Id("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldNotBeAbleToLocateByIdMultipleElementsThatDoNotExist()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("nonExistentButton"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByEmptyIdShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Id("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByEmptyIdShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id(""));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByIdWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Id("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByIdWithSpaceShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("nonexistent button"));
            Assert.AreEqual(0, elements.Count);
        }

        // By.Name positive

        [Test]
        public void ShouldBeAbleToFindASingleElementByName()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Name("checky"));
            Assert.AreEqual("furrfu", element.GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("checky"));
            Assert.That(elements, Has.Count.GreaterThan(1));
        }

        [Test]
        public void ShouldBeAbleToFindAnElementThatDoesNotSupportTheNameProperty()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.Name("div1"));
            Assert.AreEqual("div1", element.GetAttribute("name"));
        }

        // By.Name negative

        [Test]
        public void ShouldNotBeAbleToLocateByNameASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Name("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldNotBeAbleToLocateByNameMultipleElementsThatDoNotExist()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("nonExistentButton"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByEmptyNameShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Name("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByEmptyNameShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name(""));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByNameWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.Name("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByNameWithSpaceShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("nonexistent button"));
            Assert.AreEqual(0, elements.Count);
        }

        // By.tagName positive

        [Test]
        public void ShouldBeAbleToFindASingleElementByTagName()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.TagName("input"));
            Assert.AreEqual("input", element.TagName.ToLower());
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByTagName()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("input"));
            Assert.That(elements, Has.Count.GreaterThan(1));
        }

        // By.tagName negative

        [Test]
        public void ShouldNotBeAbleToLocateByTagNameASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.TagName("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldNotBeAbleToLocateByTagNameMultipleElementsThatDoNotExist()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("nonExistentButton"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByEmptyTagNameShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.TagName("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throwing invalid selector error")]
        public void FindingMultipleElementsByEmptyTagNameShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName(""));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByTagNameWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.TagName("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByTagNameWithSpaceShouldReturnEmptyList()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("nonexistent button"));
            Assert.AreEqual(0, elements.Count);
        }

        // By.ClassName positive

        [Test]
        public void ShouldBeAbleToFindASingleElementByClass()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.ClassName("extraDiv"));
            Assert.That(element.Text, Does.StartWith("Another div starts here."));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByClassName()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("nameC"));
            Assert.That(elements.Count, Is.GreaterThan(1));
        }

        [Test]
        public void ShouldFindElementByClassWhenItIsTheFirstNameAmongMany()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.ClassName("nameA"));
            Assert.AreEqual("An H2 title", element.Text);
        }

        [Test]
        public void ShouldFindElementByClassWhenItIsTheLastNameAmongMany()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.ClassName("nameC"));
            Assert.AreEqual("An H2 title", element.Text);
        }

        [Test]
        public void ShouldFindElementByClassWhenItIsInTheMiddleAmongMany()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.ClassName("nameBnoise"));
            Assert.AreEqual("An H2 title", element.Text);
        }

        [Test]
        public void ShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.ClassName("spaceAround"));
            Assert.AreEqual("Spaced out", element.Text);
        }

        [Test]
        public void ShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("spaceAround"));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("Spaced out", elements[0].Text);
        }

        // By.ClassName negative

        [Test]
        public void ShouldNotFindElementByClassWhenTheNameQueriedIsShorterThanCandidateName()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.ClassName("nameB")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingASingleElementByEmptyClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.ClassName("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByEmptyClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElements(By.ClassName("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingASingleElementByCompoundClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.ClassName("a b")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void FindingMultipleElementsByCompoundClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElements(By.ClassName("a b")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void FindingASingleElementByAWeirdLookingClassName()
        {
            driver.Url = xhtmlTestPage;
            String weird = "cls-!@#$%^&*";
            IWebElement element = driver.FindElement(By.ClassName(weird));
            Assert.AreEqual(weird, element.GetAttribute("class"));
        }

        [Test]
        public void FindingMultipleElementsByAWeirdLookingClassName()
        {
            driver.Url = xhtmlTestPage;
            String weird = "cls-!@#$%^&*";
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName(weird));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual(weird, elements[0].GetAttribute("class"));
        }

        // By.XPath positive

        [Test]
        public void ShouldBeAbleToFindASingleElementByXPath()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.XPath("//h1"));
            Assert.AreEqual("XHTML Might Be The Future", element.Text);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByXPath()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("//div"));
            Assert.AreEqual(13, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindManyElementsRepeatedlyByXPath()
        {
            driver.Url = xhtmlTestPage;
            String xpathString = "//node()[contains(@id,'id')]";
            Assert.AreEqual(3, driver.FindElements(By.XPath(xpathString)).Count);

            xpathString = "//node()[contains(@id,'nope')]";
            Assert.AreEqual(0, driver.FindElements(By.XPath(xpathString)).Count);
        }

        [Test]
        public void ShouldBeAbleToIdentifyElementsByClass()
        {
            driver.Url = xhtmlTestPage;
            IWebElement header = driver.FindElement(By.XPath("//h1[@class='header']"));
            Assert.AreEqual("XHTML Might Be The Future", header.Text);
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByXPathWithMultipleAttributes()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(
                By.XPath("//form[@name='optional']/input[@type='submit' and @value='Click!']"));
            Assert.AreEqual("input", element.TagName.ToLower());
            Assert.AreEqual("Click!", element.GetAttribute("value"));
        }

        [Test]
        public void FindingALinkByXpathShouldLocateAnElementWithTheGivenText()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.XPath("//a[text()='click me']"));
            Assert.AreEqual("click me", element.Text);
        }

        [Test]
        public void FindingALinkByXpathUsingContainsKeywordShouldWork()
        {
            driver.Url = nestedPage;
            IWebElement element = driver.FindElement(By.XPath("//a[contains(.,'hello world')]"));
            Assert.That(element.Text, Does.Contain("hello world"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Driver does not support XML namespaces in XPath")]
        [IgnoreBrowser(Browser.Firefox, "Driver does not support XML namespaces in XPath")]
        [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
        public void ShouldBeAbleToFindElementByXPathWithNamespace()
        {
            driver.Url = svgPage;
            IWebElement element = driver.FindElement(By.XPath("//svg:svg//svg:text"));
            Assert.That(element.Text, Is.EqualTo("Test Chart"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Driver does not support finding elements on XML documents.")]
        [IgnoreBrowser(Browser.Chrome, "Driver does not support finding elements on XML documents.")]
        [IgnoreBrowser(Browser.Edge, "Driver does not support finding elements on XML documents.")]
        [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
        public void ShouldBeAbleToFindElementByXPathInXmlDocument()
        {
            driver.Url = simpleXmlDocument;
            IWebElement element = driver.FindElement(By.XPath("//foo"));
            Assert.That(element.Text, Is.EqualTo("baz"));
        }

        // By.XPath negative

        [Test]
        public void ShouldThrowAnExceptionWhenThereIsNoLinkToClick()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.XPath("//a[@id='Not here']")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            Assert.That(() => driver.FindElements(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement()
        {
            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.That(() => body.FindElement(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements()
        {
            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.That(() => body.FindElements(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement()
        {
            driver.Url = formsPage;
            Assert.That(() => driver.FindElement(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            Assert.That(() => driver.FindElements(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement()
        {
            driver.Url = formsPage;

            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.That(() => body.FindElement(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
        }

        [Test]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.That(() => body.FindElements(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
        }

        // By.CssSelector positive

        [Test]
        public void ShouldBeAbleToFindASingleElementByCssSelector()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.CssSelector("div.content"));
            Assert.AreEqual("div", element.TagName.ToLower());
            Assert.AreEqual("content", element.GetAttribute("class"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByCssSelector()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.CssSelector("p"));
            Assert.That(elements, Has.Count.GreaterThan(1));
        }

        [Test]
        public void ShouldBeAbleToFindASingleElementByCompoundCssSelector()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.CssSelector("div.extraDiv, div.content"));
            Assert.AreEqual("div", element.TagName.ToLower());
            Assert.AreEqual("content", element.GetAttribute("class"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByCompoundCssSelector()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.CssSelector("div.extraDiv, div.content"));
            Assert.That(elements, Has.Count.GreaterThan(1));
            Assert.That(elements[0].GetAttribute("class"), Is.EqualTo("content"));
            Assert.That(elements[1].GetAttribute("class"), Is.EqualTo("extraDiv"));
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingCssSelector()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("locators_tests/boolean_attribute_selected.html"));
            IWebElement element = driver.FindElement(By.CssSelector("option[selected='selected']"));
            Assert.AreEqual("two", element.GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelector()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("locators_tests/boolean_attribute_selected.html"));
            IWebElement element = driver.FindElement(By.CssSelector("option[selected]"));
            Assert.AreEqual("two", element.GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelectorOnHtml4Page()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("locators_tests/boolean_attribute_selected_html4.html"));
            IWebElement element = driver.FindElement(By.CssSelector("option[selected]"));
            Assert.AreEqual("two", element.GetAttribute("value"));
        }

        // By.CssSelector negative

        [Test]
        public void ShouldNotFindElementByCssSelectorWhenThereIsNoSuchElement()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.CssSelector(".there-is-no-such-class")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldNotFindElementsByCssSelectorWhenThereIsNoSuchElement()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.CssSelector(".there-is-no-such-class"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByEmptyCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.CssSelector("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByEmptyCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElements(By.CssSelector("")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingASingleElementByInvalidCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.CssSelector("//a/b/c[@id='1']")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void FindingMultipleElementsByInvalidCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElements(By.CssSelector("//a/b/c[@id='1']")), Throws.InstanceOf<NoSuchElementException>());
        }

        // By.linkText positive

        [Test]
        public void ShouldBeAbleToFindALinkByText()
        {
            driver.Url = xhtmlTestPage;
            IWebElement link = driver.FindElement(By.LinkText("click me"));
            Assert.AreEqual("click me", link.Text);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleLinksByText()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("click me"));
            Assert.AreEqual(2, elements.Count, "Expected 2 links, got " + elements.Count);
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.LinkText("Link=equalssign"));
            Assert.AreEqual("linkWithEqualsSign", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindMultipleElementsByLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("Link=equalssign"));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("linkWithEqualsSign", elements[0].GetAttribute("id"));
        }

        [Test]
        public void FindsByLinkTextOnXhtmlPage()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                // Old IE doesn't render XHTML pages, don't try loading XHTML pages in it
                return;
            }

            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("actualXhtmlPage.xhtml"));
            string linkText = "Foo";
            IWebElement element = driver.FindElement(By.LinkText(linkText));
            Assert.AreEqual(linkText, element.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        public void LinkWithFormattingTags()
        {
            driver.Url = (simpleTestPage);
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with formatting tags"));
            Assert.AreEqual("link with formatting tags", res.Text);
        }

        [Test]
        public void DriverCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement link = driver.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
            Assert.AreEqual("link with trailing space", link.Text);
        }

        // By.linkText negative

        [Test]
        public void ShouldNotBeAbleToLocateByLinkTextASingleElementThatDoesNotExist()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.FindElement(By.LinkText("Not here either")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void ShouldNotBeAbleToLocateByLinkTextMultipleElementsThatDoNotExist()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("Not here either"));
            Assert.AreEqual(0, elements.Count);
        }

        // By.partialLinkText positive

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByPartialLinkText()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("ick me"));
            Assert.AreEqual(2, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindASingleElementByPartialLinkText()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.PartialLinkText("anon"));
            Assert.That(element.Text, Does.Contain("anon"));
        }

        [Test]
        public void ShouldFindElementByPartialLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.PartialLinkText("Link="));
            Assert.AreEqual("linkWithEqualsSign", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindMultipleElementsByPartialLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("Link="));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("linkWithEqualsSign", elements[0].GetAttribute("id"));
        }

        // Misc tests

        [Test]
        public void DriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime()
        {
            driver.Url = formsPage;
            driver.Url = xhtmlTestPage;
            IWebElement link = driver.FindElement(By.LinkText("click me"));
            Assert.AreEqual("click me", link.Text);
        }

        // You don't want to ask why this is here
        [Test]
        public void WhenFindingByNameShouldNotReturnById()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("id-name1"));
            Assert.AreEqual("name", element.GetAttribute("value"));

            element = driver.FindElement(By.Id("id-name1"));
            Assert.AreEqual("id", element.GetAttribute("value"));

            element = driver.FindElement(By.Name("id-name2"));
            Assert.AreEqual("name", element.GetAttribute("value"));

            element = driver.FindElement(By.Id("id-name2"));
            Assert.AreEqual("id", element.GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToFindAHiddenElementsByName()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Name("hidden"));
            Assert.AreEqual("hidden", element.GetAttribute("name"));
        }

        [Test]
        public void ShouldNotBeAbleToFindAnElementOnABlankPage()
        {
            driver.Url = "about:blank";
            Assert.That(() => driver.FindElement(By.TagName("a")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldNotBeAbleToLocateASingleElementOnABlankPage()
        {
            // Note we're on the default start page for the browser at this point.
            Assert.That(() => driver.FindElement(By.Id("nonExistantButton")), Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3742")]
        [IgnoreBrowser(Browser.Edge, "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3742")]
        public void AnElementFoundInADifferentFrameIsStale()
        {
            driver.Url = missedJsReferencePage;
            driver.SwitchTo().Frame("inner");
            IWebElement element = driver.FindElement(By.Id("oneline"));
            driver.SwitchTo().DefaultContent();
            Assert.That(() => { string foo = element.Text; }, Throws.InstanceOf<NoSuchElementException>());
        }

        [Test]
        public void AnElementFoundInADifferentFrameViaJsCanBeUsed()
        {
            driver.Url = missedJsReferencePage;

            try
            {
                driver.SwitchTo().Frame("inner");
                IWebElement first = driver.FindElement(By.Id("oneline"));

                driver.SwitchTo().DefaultContent();
                IWebElement element = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript(
                    "return frames[0].document.getElementById('oneline');");


                driver.SwitchTo().Frame("inner");

                IWebElement second = driver.FindElement(By.Id("oneline"));

                Assert.AreEqual(first, element);
                Assert.AreEqual(second, element);
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        /////////////////////////////////////////////////
        // Tests unique to the .NET bindings
        /////////////////////////////////////////////////
        [Test]
        public void ShouldReturnTitleOfPageIfSet()
        {
            driver.Url = xhtmlTestPage;
            Assert.AreEqual(driver.Title, "XHTML Test Page");

            driver.Url = simpleTestPage;
            Assert.AreEqual(driver.Title, "Hello WebDriver");
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkIdentifiedByText()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("click me")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkIdentifiedById()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Id("linkId")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldFindAnElementBasedOnId()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Id("checky"));

            Assert.That(element.Selected, Is.False);
        }

        [Test]
        public void ShouldBeAbleToFindChildrenOfANode()
        {
            driver.Url = selectableItemsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("/html/head"));
            IWebElement head = elements[0];
            ReadOnlyCollection<IWebElement> importedScripts = head.FindElements(By.TagName("script"));
            Assert.AreEqual(importedScripts.Count, 3);
        }

        [Test]
        public void ReturnAnEmptyListWhenThereAreNoChildrenOfANode()
        {
            driver.Url = xhtmlTestPage;
            IWebElement table = driver.FindElement(By.Id("table"));
            ReadOnlyCollection<IWebElement> rows = table.FindElements(By.TagName("tr"));

            Assert.AreEqual(rows.Count, 0);
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("checky"));

            Assert.AreEqual(element.GetAttribute("value"), "furrfu");
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsTheFirstNameAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameA"));
            Assert.AreEqual(element.Text, "An H2 title");
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsTheLastNameAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameC"));
            Assert.AreEqual(element.Text, "An H2 title");
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsInTheMiddleAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameBnoise"));
            Assert.AreEqual(element.Text, "An H2 title");
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
        public void ShouldReturnElementsThatDoNotSupportTheNameProperty()
        {
            driver.Url = nestedPage;

            driver.FindElement(By.Name("div1"));
            // If this works, we're all good
        }

        [Test]
        public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.LinkText("No href"));
            element.Click();

            // if any exception is thrown, we won't get this far. Sanity check
            Assert.AreEqual("Changed", driver.Title);
        }

        [Test]
        public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
        {
            driver.Url = javascriptPage;

            IWebElement toBeDeleted = driver.FindElement(By.Id("deleted"));
            Assert.That(toBeDeleted.Displayed, "Element is not displayed");

            driver.FindElement(By.Id("delete")).Click();
            Assert.That(() => { bool displayedAfterDelete = toBeDeleted.Displayed; }, Throws.InstanceOf<StaleElementReferenceException>());
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
        public void FindingByXPathShouldNotIncludeParentElementIfSameTagType()
        {
            driver.Url = xhtmlTestPage;
            IWebElement parent = driver.FindElement(By.Id("my_span"));

            Assert.AreEqual(2, parent.FindElements(By.TagName("div")).Count);
            Assert.AreEqual(2, parent.FindElements(By.TagName("span")).Count);
        }

        [Test]
        public void ShouldBeAbleToInjectXPathEngineIfNeeded()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.XPath("//body"));
            driver.FindElement(By.XPath("//h1"));
            driver.FindElement(By.XPath("//div"));
            driver.FindElement(By.XPath("//p"));
            driver.FindElement(By.XPath("//a"));
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingDoubleQuote()
        {
            driver.Url = simpleTestPage;
            IWebElement element = driver.FindElement(By.LinkText("link with \" (double quote)"));
            Assert.AreEqual("quote", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingBackslash()
        {
            driver.Url = simpleTestPage;
            IWebElement element = driver.FindElement(By.LinkText("link with \\ (backslash)"));
            Assert.AreEqual("backslash", element.GetAttribute("id"));
        }
    }
}
