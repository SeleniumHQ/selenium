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
        [IgnoreBrowser(Browser.Android, "Bug in Android's XPath library.")]
        public void ShouldBeAbleToFindMultipleElementsById()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("2"));
            Assert.AreEqual(8, elements.Count);
        }

        // By.id negative

        [Test]
        public void ShouldNotBeAbleToLocateByIdASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("nonExistentButton")));
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
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => driver.FindElement(By.Id("")));
        }

        [Test]
        public void FindingMultipleElementsByEmptyIdShouldThrow()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id(""));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByIdWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("nonexistent button")));
        }

        [Test]
        public void FindingMultipleElementsByIdWithSpaceShouldThrow()
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
            Assert.Greater(elements.Count, 1);
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Name("nonExistentButton")));
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Name("")));
        }

        [Test]
        public void FindingMultipleElementsByEmptyNameShouldThrow()
        {
            driver.Url = formsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name(""));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        public void FindingASingleElementByNameWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Name("nonexistent button")));
        }

        [Test]
        public void FindingMultipleElementsByNameWithSpaceShouldThrow()
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
            Assert.Greater(elements.Count, 1);
        }

        // By.tagName negative

        [Test]
        public void ShouldNotBeAbleToLocateByTagNameASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.TagName("nonExistentButton")));
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
            Assert.Throws<InvalidSelectorException>(() => driver.FindElement(By.TagName("")));
        }

        [Test]
        public void FindingMultipleElementsByEmptyTagNameShouldThrow()
        {
            driver.Url = formsPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElements(By.TagName("")));;
        }

        [Test]
        public void FindingASingleElementByTagNameWithSpaceShouldThrow()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.TagName("nonexistent button")));
        }

        [Test]
        public void FindingMultipleElementsByTagNameWithSpaceShouldThrow()
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
            Assert.IsTrue(element.Text.StartsWith("Another div starts here."));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByClassName()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("nameC"));
            Assert.Greater(elements.Count, 1);
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.ClassName("nameB")));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        public void FindingASingleElementByEmptyClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElement(By.ClassName("")); });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingMultipleElementsByEmptyClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElements(By.ClassName("")); });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingASingleElementByCompoundClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElement(By.ClassName("a b")));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingMultipleElementsByCompoundClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElements(By.ClassName("a b")));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingASingleElementByInvalidClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElement(By.ClassName("!@#$%^&*")); });
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Class name is perfectly legal when using CSS selector, if properly escaped.")]
        [IgnoreBrowser(Browser.Firefox, "Class name is perfectly legal when using CSS selector, if properly escaped.")]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingMultipleElementsByInvalidClassNameShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElements(By.ClassName("!@#$%^&*")); });
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
            Assert.IsTrue(element.Text.Contains("hello world"));
        }

        // By.XPath negative

        [Test]
        public void ShouldThrowAnExceptionWhenThereIsNoLinkToClick()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.XPath("//a[@id='Not here']")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement()
        {
            driver.Url = formsPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElement(By.XPath("this][isnot][valid")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElements(By.XPath("this][isnot][valid")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement()
        {
            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.Throws<InvalidSelectorException>(() => body.FindElement(By.XPath("this][isnot][valid")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements()
        {
            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.Throws<InvalidSelectorException>(() => body.FindElements(By.XPath("this][isnot][valid")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement()
        {
            driver.Url = formsPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElement(By.XPath("count(//input)")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            Assert.Throws<InvalidSelectorException>(() => driver.FindElements(By.XPath("count(//input)")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement()
        {
            driver.Url = formsPage;

            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.Throws<InvalidSelectorException>(() => body.FindElement(By.XPath("count(//input)")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements()
        {
            if (TestUtilities.IsIE6(driver))
            {
                // Ignoring xpath error test in IE6
                return;
            }

            driver.Url = formsPage;
            IWebElement body = driver.FindElement(By.TagName("body"));
            Assert.Throws<InvalidSelectorException>(() => body.FindElements(By.XPath("count(//input)")));
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
            Assert.Greater(elements.Count, 1);
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
            Assert.Greater(elements.Count, 1);
            Assert.AreEqual("content", elements[0].GetAttribute("class"));
            Assert.AreEqual("extraDiv", elements[1].GetAttribute("class"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE supports only short version option[selected]")]
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.CssSelector(".there-is-no-such-class")));
        }

        [Test]
        public void ShouldNotFindElementsByCssSelectorWhenThereIsNoSuchElement()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.CssSelector(".there-is-no-such-class"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        public void FindingASingleElementByEmptyCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElement(By.CssSelector("")); });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws WebDriverException")]
        [IgnoreBrowser(Browser.Opera, "Throws WebDriverException")]
        public void FindingMultipleElementsByEmptyCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElements(By.CssSelector("")); });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws InvalidElementStateException")]
        public void FindingASingleElementByInvalidCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElement(By.CssSelector("//a/b/c[@id='1']")); });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Throws InvalidElementStateException")]
        [IgnoreBrowser(Browser.Opera, "Throws InvalidElementStateException")]
        public void FindingMultipleElementsByInvalidCssSelectorShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            Assert.Throws(Is.InstanceOf<NoSuchElementException>(), () => { driver.FindElements(By.CssSelector("//a/b/c[@id='1']")); });
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
        [IgnoreBrowser(Browser.Opera)]
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.LinkText("Not here either")));
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
            Assert.IsTrue(element.Text.Contains("anon"));
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
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.TagName("a")));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        [IgnoreBrowser(Browser.IPhone)]
        public void ShouldNotBeAbleToLocateASingleElementOnABlankPage()
        {
            // Note we're on the default start page for the browser at this point.
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("nonExistantButton")));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Just not working")]
        [IgnoreBrowser(Browser.Opera, "Just not working")]
        public void AnElementFoundInADifferentFrameIsStale()
        {
            driver.Url = missedJsReferencePage;
            driver.SwitchTo().Frame("inner");
            IWebElement element = driver.FindElement(By.Id("oneline"));
            driver.SwitchTo().DefaultContent();
            Assert.Throws<StaleElementReferenceException>(() => { string foo = element.Text; });
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
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

            Assert.IsFalse(element.Selected);
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
            Assert.Throws<NoSuchElementException>(() => element.FindElement(By.Name("x")));
        }

        [Test]
        public void ShouldReturnElementsThatDoNotSupportTheNameProperty()
        {
            driver.Url = nestedPage;

            driver.FindElement(By.Name("div1"));
            // If this works, we're all good
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.LinkText("No href"));
            element.Click();

            // if any exception is thrown, we won't get this far. Sanity check
            Assert.AreEqual("Changed", driver.Title);
        }

        [Test]
        [Category("Javascript")]
        public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
        {
            driver.Url = javascriptPage;

            IWebElement toBeDeleted = driver.FindElement(By.Id("deleted"));
            Assert.IsTrue(toBeDeleted.Displayed);

            driver.FindElement(By.Id("delete")).Click();
            Assert.Throws<StaleElementReferenceException>(() => { bool displayedAfterDelete = toBeDeleted.Displayed; });
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

        private bool SupportsSelectorApi()
        {
            IJavaScriptExecutor javascriptDriver = driver as IJavaScriptExecutor;
            IFindsByCssSelector cssSelectorDriver = driver as IFindsByCssSelector;
            return (cssSelectorDriver != null) && (javascriptDriver != null);
        }
    }
}
