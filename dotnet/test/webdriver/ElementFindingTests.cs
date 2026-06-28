// <copyright file="ElementFindingTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ElementFindingTests : DriverTestFixture
{
    // By.id positive

    [Test]
    public void ShouldBeAbleToFindASingleElementById()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.Id("linkId"));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("linkId"));
    }

    [Test]
    public void ShouldBeAbleToFindASingleElementByNumericId()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement element = Driver.FindElement(By.Id("2"));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("2"));
    }

    [Test]
    public void ShouldBeAbleToFindASingleElementByIdWithNonAlphanumericCharacters()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement element = Driver.FindElement(By.Id("white space"));
        Assert.That(element.Text, Is.EqualTo("space"));
        IWebElement element2 = Driver.FindElement(By.Id("css#.chars"));
        Assert.That(element2.Text, Is.EqualTo("css escapes"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsById()
    {
        Driver.Url = Urls.NestedPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id("2"));
        Assert.That(elements, Has.Exactly(8).Items);
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByNumericId()
    {
        Driver.Url = Urls.NestedPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id("2"));
        Assert.That(elements, Has.Exactly(8).Items);
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByIdWithNonAlphanumericCharacters()
    {
        Driver.Url = Urls.NestedPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id("white space"));
        Assert.That(elements, Has.Exactly(2).Items);
        ReadOnlyCollection<IWebElement> elements2 = Driver.FindElements(By.Id("css#.chars"));
        Assert.That(elements2, Has.Exactly(2).Items);
    }

    // By.id negative

    [Test]
    public void ShouldNotBeAbleToLocateByIdASingleElementThatDoesNotExist()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Id("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotBeAbleToLocateByIdMultipleElementsThatDoNotExist()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id("nonExistentButton"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByEmptyIdShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Id("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingMultipleElementsByEmptyIdShouldReturnEmptyList()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id(""));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByIdWithSpaceShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Id("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingMultipleElementsByIdWithSpaceShouldReturnEmptyList()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Id("nonexistent button"));
        Assert.That(elements, Is.Empty);
    }

    // By.Name positive

    [Test]
    public void ShouldBeAbleToFindASingleElementByName()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Name("checky"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("furrfu"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByName()
    {
        Driver.Url = Urls.NestedPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Name("checky"));
        Assert.That(elements, Has.Count.GreaterThan(1));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementThatDoesNotSupportTheNameProperty()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement element = Driver.FindElement(By.Name("div1"));
        Assert.That(element.GetAttribute("name"), Is.EqualTo("div1"));
    }

    // By.Name negative

    [Test]
    public void ShouldNotBeAbleToLocateByNameASingleElementThatDoesNotExist()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Name("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotBeAbleToLocateByNameMultipleElementsThatDoNotExist()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Name("nonExistentButton"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByEmptyNameShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Name("")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingMultipleElementsByEmptyNameShouldReturnEmptyList()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Name(""));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByNameWithSpaceShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Name("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingMultipleElementsByNameWithSpaceShouldReturnEmptyList()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.Name("nonexistent button"));
        Assert.That(elements, Is.Empty);
    }

    // By.tagName positive

    [Test]
    public void ShouldBeAbleToFindASingleElementByTagName()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.TagName("input"));
        Assert.That(element.TagName.ToLower(), Is.EqualTo("input"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByTagName()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.TagName("input"));
        Assert.That(elements, Has.Count.GreaterThan(1));
    }

    // By.tagName negative

    [Test]
    public void ShouldNotBeAbleToLocateByTagNameASingleElementThatDoesNotExist()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.TagName("nonExistentButton")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotBeAbleToLocateByTagNameMultipleElementsThatDoNotExist()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.TagName("nonExistentButton"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByEmptyTagNameShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.TagName("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingASingleElementByTagNameWithSpaceShouldThrow()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.TagName("nonexistent button")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingMultipleElementsByTagNameWithSpaceShouldReturnEmptyList()
    {
        Driver.Url = Urls.FormsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.TagName("nonexistent button"));
        Assert.That(elements, Is.Empty);
    }

    // By.ClassName positive

    [Test]
    public void ShouldBeAbleToFindASingleElementByClass()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.ClassName("extraDiv"));
        Assert.That(element.Text, Does.StartWith("Another div starts here."));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByClassName()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName("nameC"));
        Assert.That(elements, Has.Count.GreaterThan(1));
    }

    [Test]
    public void ShouldFindElementByClassWhenItIsTheFirstNameAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.ClassName("nameA"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindElementByClassWhenItIsTheLastNameAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.ClassName("nameC"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindElementByClassWhenItIsInTheMiddleAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.ClassName("nameBnoise"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.ClassName("spaceAround"));
        Assert.That(element.Text, Is.EqualTo("Spaced out"));
    }

    [Test]
    public void ShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName("spaceAround"));
        Assert.That(elements, Has.Exactly(1).Items);
        Assert.That(elements[0].Text, Is.EqualTo("Spaced out"));
    }

    // By.ClassName negative

    [Test]
    public void ShouldNotFindElementByClassWhenTheNameQueriedIsShorterThanCandidateName()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.ClassName("nameB")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingASingleElementByEmptyClassNameShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.ClassName("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingMultipleElementsByEmptyClassNameShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElements(By.ClassName("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingASingleElementByCompoundClassNameShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.ClassName("a b")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void FindingMultipleElementsByCompoundClassNameShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElements(By.ClassName("a b")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void FindingASingleElementByAWeirdLookingClassName()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String weird = "cls-!@#$%^&*";
        IWebElement element = Driver.FindElement(By.ClassName(weird));
        Assert.That(element.GetAttribute("class"), Is.EqualTo(weird));
    }

    [Test]
    public void FindingMultipleElementsByAWeirdLookingClassName()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String weird = "cls-!@#$%^&*";
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName(weird));
        Assert.That(elements, Has.Count.EqualTo(1));
        Assert.That(elements[0].GetAttribute("class"), Is.EqualTo(weird));
    }

    // By.XPath positive

    [Test]
    public void ShouldBeAbleToFindASingleElementByXPath()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.XPath("//h1"));
        Assert.That(element.Text, Is.EqualTo("XHTML Might Be The Future"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByXPath()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.XPath("//div"));
        Assert.That(elements, Has.Count.EqualTo(13));
    }

    [Test]
    public void ShouldBeAbleToFindManyElementsRepeatedlyByXPath()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String xpathString = "//node()[contains(@id,'id')]";
        Assert.That(Driver.FindElements(By.XPath(xpathString)), Has.Exactly(3).Items);

        xpathString = "//node()[contains(@id,'nope')]";
        Assert.That(Driver.FindElements(By.XPath(xpathString)), Is.Empty);
    }

    [Test]
    public void ShouldBeAbleToIdentifyElementsByClass()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement header = Driver.FindElement(By.XPath("//h1[@class='header']"));
        Assert.That(header.Text, Is.EqualTo("XHTML Might Be The Future"));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByXPathWithMultipleAttributes()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(
            By.XPath("//form[@name='optional']/input[@type='submit' and @value='Click!']"));
        Assert.That(element.TagName.ToLower(), Is.EqualTo("input"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("Click!"));
    }

    [Test]
    public void FindingALinkByXpathShouldLocateAnElementWithTheGivenText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.XPath("//a[text()='click me']"));
        Assert.That(element.Text, Is.EqualTo("click me"));
    }

    [Test]
    public void FindingALinkByXpathUsingContainsKeywordShouldWork()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement element = Driver.FindElement(By.XPath("//a[contains(.,'hello world')]"));
        Assert.That(element.Text, Does.Contain("hello world"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Driver does not support XML namespaces in XPath")]
    [IgnoreBrowser(Browser.Firefox, "Driver does not support XML namespaces in XPath")]
    [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
    public void ShouldBeAbleToFindElementByXPathWithNamespace()
    {
        Driver.Url = Urls.SvgPage;
        IWebElement element = Driver.FindElement(By.XPath("//svg:svg//svg:text"));
        Assert.That(element.Text, Is.EqualTo("Test Chart"));
    }

    // By.XPath negative

    [Test]
    public void ShouldThrowAnExceptionWhenThereIsNoLinkToClick()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.XPath("//a[@id='Not here']")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements()
    {
        if (TestUtilities.IsIE6(Driver))
        {
            // Ignoring xpath error test in IE6
            return;
        }

        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElements(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement body = Driver.FindElement(By.TagName("body"));
        Assert.That(() => body.FindElement(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement body = Driver.FindElement(By.TagName("body"));
        Assert.That(() => body.FindElements(By.XPath("this][isnot][valid")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements()
    {
        if (TestUtilities.IsIE6(Driver))
        {
            // Ignoring xpath error test in IE6
            return;
        }

        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElements(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement body = Driver.FindElement(By.TagName("body"));
        Assert.That(() => body.FindElement(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void ShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements()
    {
        if (TestUtilities.IsIE6(Driver))
        {
            // Ignoring xpath error test in IE6
            return;
        }

        Driver.Url = Urls.FormsPage;
        IWebElement body = Driver.FindElement(By.TagName("body"));
        Assert.That(() => body.FindElements(By.XPath("count(//input)")), Throws.InstanceOf<InvalidSelectorException>());
    }

    // By.CssSelector positive

    [Test]
    public void ShouldBeAbleToFindASingleElementByCssSelector()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.CssSelector("div.content"));
        Assert.That(element.TagName.ToLower(), Is.EqualTo("div"));
        Assert.That(element.GetAttribute("class"), Is.EqualTo("content"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByCssSelector()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.CssSelector("p"));
        Assert.That(elements, Has.Count.GreaterThan(1));
    }

    [Test]
    public void ShouldBeAbleToFindASingleElementByCompoundCssSelector()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.CssSelector("div.extraDiv, div.content"));
        Assert.That(element.TagName.ToLower(), Is.EqualTo("div"));
        Assert.That(element.GetAttribute("class"), Is.EqualTo("content"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByCompoundCssSelector()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.CssSelector("div.extraDiv, div.content"));
        Assert.That(elements, Has.Count.GreaterThan(1));
        Assert.That(elements[0].GetAttribute("class"), Is.EqualTo("content"));
        Assert.That(elements[1].GetAttribute("class"), Is.EqualTo("extraDiv"));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingCssSelector()
    {
        Driver.Url = (Urls.WhereIs("locators_tests/boolean_attribute_selected.html"));
        IWebElement element = Driver.FindElement(By.CssSelector("option[selected='selected']"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("two"));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelector()
    {
        Driver.Url = (Urls.WhereIs("locators_tests/boolean_attribute_selected.html"));
        IWebElement element = Driver.FindElement(By.CssSelector("option[selected]"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("two"));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelectorOnHtml4Page()
    {
        Driver.Url = (Urls.WhereIs("locators_tests/boolean_attribute_selected_html4.html"));
        IWebElement element = Driver.FindElement(By.CssSelector("option[selected]"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("two"));
    }

    // By.CssSelector negative

    [Test]
    public void ShouldNotFindElementByCssSelectorWhenThereIsNoSuchElement()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.CssSelector(".there-is-no-such-class")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotFindElementsByCssSelectorWhenThereIsNoSuchElement()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.CssSelector(".there-is-no-such-class"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    public void FindingASingleElementByEmptyCssSelectorShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.CssSelector("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingMultipleElementsByEmptyCssSelectorShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElements(By.CssSelector("")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingASingleElementByInvalidCssSelectorShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.CssSelector("//a/b/c[@id='1']")), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void FindingMultipleElementsByInvalidCssSelectorShouldThrow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElements(By.CssSelector("//a/b/c[@id='1']")), Throws.InstanceOf<WebDriverException>());
    }

    // By.linkText positive

    [Test]
    public void ShouldBeAbleToFindALinkByText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement link = Driver.FindElement(By.LinkText("click me"));
        Assert.That(link.Text, Is.EqualTo("click me"));
    }

    [Test]
    public void ShouldBeAbleToFindMultipleLinksByText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.LinkText("click me"));
        Assert.That(elements, Has.Count.EqualTo(2), "Expected 2 links, got " + elements.Count);
    }

    [Test]
    public void ShouldFindElementByLinkTextContainingEqualsSign()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.LinkText("Link=equalssign"));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("linkWithEqualsSign"));
    }

    [Test]
    public void ShouldFindMultipleElementsByLinkTextContainingEqualsSign()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.LinkText("Link=equalssign"));
        Assert.That(elements, Has.Count.EqualTo(1));
        Assert.That(elements[0].GetAttribute("id"), Is.EqualTo("linkWithEqualsSign"));
    }

    [Test]
    public void FindsByLinkTextOnXhtmlPage()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            // Old IE doesn't render XHTML pages, don't try loading XHTML pages in it
            return;
        }

        Driver.Url = (Urls.WhereIs("actualXhtmlPage.xhtml"));
        string linkText = "Foo";
        IWebElement element = Driver.FindElement(By.LinkText(linkText));
        Assert.That(element.Text, Is.EqualTo(linkText));
    }

    [Test]
    [IgnoreBrowser(Browser.Remote)]
    public void LinkWithFormattingTags()
    {
        Driver.Url = (Urls.SimpleTestPage);
        IWebElement elem = Driver.FindElement(By.Id("links"));

        IWebElement res = elem.FindElement(By.PartialLinkText("link with formatting tags"));
        Assert.That(res.Text, Is.EqualTo("link with formatting tags"));
    }

    [Test]
    public void DriverCanGetLinkByLinkTestIgnoringTrailingWhitespace()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement link = Driver.FindElement(By.LinkText("link with trailing space"));
        Assert.That(link.GetAttribute("id"), Is.EqualTo("linkWithTrailingSpace"));
        Assert.That(link.Text, Is.EqualTo("link with trailing space"));
    }

    // By.linkText negative

    [Test]
    public void ShouldNotBeAbleToLocateByLinkTextASingleElementThatDoesNotExist()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => Driver.FindElement(By.LinkText("Not here either")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotBeAbleToLocateByLinkTextMultipleElementsThatDoNotExist()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.LinkText("Not here either"));
        Assert.That(elements, Is.Empty);
    }

    // By.partialLinkText positive

    [Test]
    public void ShouldBeAbleToFindMultipleElementsByPartialLinkText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.PartialLinkText("ick me"));
        Assert.That(elements, Has.Exactly(2).Items);
    }

    [Test]
    public void ShouldBeAbleToFindASingleElementByPartialLinkText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.PartialLinkText("anon"));
        Assert.That(element.Text, Does.Contain("anon"));
    }

    [Test]
    public void ShouldFindElementByPartialLinkTextContainingEqualsSign()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.PartialLinkText("Link="));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("linkWithEqualsSign"));
    }

    [Test]
    public void ShouldFindMultipleElementsByPartialLinkTextContainingEqualsSign()
    {
        Driver.Url = Urls.XhtmlTestPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.PartialLinkText("Link="));
        Assert.That(elements, Has.Count.EqualTo(1));
        Assert.That(elements[0].GetAttribute("id"), Is.EqualTo("linkWithEqualsSign"));
    }

    // Misc tests

    [Test]
    public void DriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime()
    {
        Driver.Url = Urls.FormsPage;
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement link = Driver.FindElement(By.LinkText("click me"));
        Assert.That(link.Text, Is.EqualTo("click me"));
    }

    // You don't want to ask why this is here
    [Test]
    public void WhenFindingByNameShouldNotReturnById()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement element = Driver.FindElement(By.Name("id-name1"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("name"));

        element = Driver.FindElement(By.Id("id-name1"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("id"));

        element = Driver.FindElement(By.Name("id-name2"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("name"));

        element = Driver.FindElement(By.Id("id-name2"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("id"));
    }

    [Test]
    public void ShouldBeAbleToFindAHiddenElementsByName()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Name("hidden"));
        Assert.That(element.GetAttribute("name"), Is.EqualTo("hidden"));
    }

    [Test]
    public void ShouldNotBeAbleToFindAnElementOnABlankPage()
    {
        Driver.Url = "about:blank";
        Assert.That(() => Driver.FindElement(By.TagName("a")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldNotBeAbleToLocateASingleElementOnABlankPage()
    {
        // Note we're on the default start page for the browser at this point.
        Assert.That(() => Driver.FindElement(By.Id("nonExistantButton")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Already updated to https://github.com/w3c/webdriver/issues/1594")]
    public void AnElementFoundInADifferentFrameIsStale()
    {
        Driver.Url = Urls.MissedJsReferencePage;
        Driver.SwitchTo().Frame("inner");
        IWebElement element = Driver.FindElement(By.Id("oneline"));
        Driver.SwitchTo().DefaultContent();
        Assert.That(() => { string foo = element.Text; }, Throws.InstanceOf<NoSuchElementException>());
    }

    /////////////////////////////////////////////////
    // Tests unique to the .NET bindings
    /////////////////////////////////////////////////
    [Test]
    public void ShouldReturnTitleOfPageIfSet()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));

        Driver.Url = Urls.SimpleTestPage;
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldBeAbleToClickOnLinkIdentifiedByText()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.LinkText("click me")).Click();
        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldBeAbleToClickOnLinkIdentifiedById()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.Id("linkId")).Click();
        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldFindAnElementBasedOnId()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement element = Driver.FindElement(By.Id("checky"));

        Assert.That(element.Selected, Is.False);
    }

    [Test]
    public void ShouldBeAbleToFindChildrenOfANode()
    {
        Driver.Url = Urls.SelectableItemsPage;
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.XPath("/html/head"));
        IWebElement head = elements[0];
        ReadOnlyCollection<IWebElement> importedScripts = head.FindElements(By.TagName("script"));
        Assert.That(importedScripts, Has.Exactly(3).Items);
    }

    [Test]
    public void ReturnAnEmptyListWhenThereAreNoChildrenOfANode()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement table = Driver.FindElement(By.Id("table"));
        ReadOnlyCollection<IWebElement> rows = table.FindElements(By.TagName("tr"));

        Assert.That(rows, Is.Empty);
    }

    [Test]
    public void ShouldFindElementsByName()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement element = Driver.FindElement(By.Name("checky"));

        Assert.That(element.GetAttribute("value"), Is.EqualTo("furrfu"));
    }

    [Test]
    public void ShouldFindElementsByClassWhenItIsTheFirstNameAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;

        IWebElement element = Driver.FindElement(By.ClassName("nameA"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindElementsByClassWhenItIsTheLastNameAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;

        IWebElement element = Driver.FindElement(By.ClassName("nameC"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindElementsByClassWhenItIsInTheMiddleAmongMany()
    {
        Driver.Url = Urls.XhtmlTestPage;

        IWebElement element = Driver.FindElement(By.ClassName("nameBnoise"));
        Assert.That(element.Text, Is.EqualTo("An H2 title"));
    }

    [Test]
    public void ShouldFindGrandChildren()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement form = Driver.FindElement(By.Id("nested_form"));
        form.FindElement(By.Name("x"));
    }

    [Test]
    public void ShouldNotFindElementOutSideTree()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Name("login"));
        Assert.That(() => element.FindElement(By.Name("x")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldReturnElementsThatDoNotSupportTheNameProperty()
    {
        Driver.Url = Urls.NestedPage;

        Driver.FindElement(By.Name("div1"));
        // If this works, we're all good
    }

    [Test]
    public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.LinkText("No href"));
        element.Click();

        // if any exception is thrown, we won't get this far. Sanity check
        Assert.That(Driver.Title, Is.EqualTo("Changed"));
    }

    [Test]
    public void FindingByTagNameShouldNotIncludeParentElementIfSameTagType()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement parent = Driver.FindElement(By.Id("my_span"));

        Assert.That(parent.FindElements(By.TagName("div")), Has.Count.EqualTo(2));
        Assert.That(parent.FindElements(By.TagName("span")), Has.Count.EqualTo(2));
    }

    [Test]
    public void FindingByCssShouldNotIncludeParentElementIfSameTagType()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement parent = Driver.FindElement(By.CssSelector("div#parent"));
        IWebElement child = parent.FindElement(By.CssSelector("div"));

        Assert.That(child.GetAttribute("id"), Is.EqualTo("child"));
    }

    [Test]
    public void FindingByXPathShouldNotIncludeParentElementIfSameTagType()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement parent = Driver.FindElement(By.Id("my_span"));

        Assert.That(parent.FindElements(By.TagName("div")), Has.Count.EqualTo(2));
        Assert.That(parent.FindElements(By.TagName("span")), Has.Count.EqualTo(2));
    }

    [Test]
    public void ShouldBeAbleToInjectXPathEngineIfNeeded()
    {
        Driver.Url = Urls.AlertsPage;
        Driver.FindElement(By.XPath("//body"));
        Driver.FindElement(By.XPath("//h1"));
        Driver.FindElement(By.XPath("//div"));
        Driver.FindElement(By.XPath("//p"));
        Driver.FindElement(By.XPath("//a"));
    }

    [Test]
    public void ShouldFindElementByLinkTextContainingDoubleQuote()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement element = Driver.FindElement(By.LinkText("link with \" (double quote)"));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("quote"));
    }

    [Test]
    public void ShouldFindElementByLinkTextContainingBackslash()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement element = Driver.FindElement(By.LinkText("link with \\ (backslash)"));
        Assert.That(element.GetAttribute("id"), Is.EqualTo("backslash"));
    }
}
