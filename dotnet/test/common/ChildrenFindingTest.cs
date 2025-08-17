// <copyright file="ChildrenFindingTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium;

[TestFixture]
public class ChildrenFindingTest : DriverTestFixture
{
    [Test]
    public void FindElementByXPath()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));
        IWebElement child = element.FindElement(By.XPath("select"));
        Assert.That(child.GetAttribute("id"), Is.EqualTo("2"));
    }

    [Test]
    public void FindingElementsOnElementByXPathShouldFindTopLevelElements()
    {
        driver.Url = simpleTestPage;
        IWebElement parent = driver.FindElement(By.Id("multiline"));
        ReadOnlyCollection<IWebElement> allParaElements = driver.FindElements(By.XPath("//p"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("//p"));
        Assert.That(children, Has.Exactly(allParaElements.Count).Items);
    }

    [Test]
    public void FindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements()
    {
        driver.Url = simpleTestPage;
        IWebElement parent = driver.FindElement(By.Id("multiline"));

        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("./p"));
        Assert.That(children, Has.One.Items);
        Assert.That(children[0].Text, Is.EqualTo("A div containing"));
    }

    [Test]
    public void FindElementByXPathWhenNoMatch()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));

        Assert.That(
            () => element.FindElement(By.XPath("select/x")),
            Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindElementsByXPath()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));

        ReadOnlyCollection<IWebElement> children = element.FindElements(By.XPath("select/option"));
        Assert.That(children, Has.Exactly(8).Items);
        Assert.That(children[0].Text, Is.EqualTo("One"));
        Assert.That(children[1].Text, Is.EqualTo("Two"));
    }

    [Test]
    public void FindElementsByXPathWhenNoMatch()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));
        ReadOnlyCollection<IWebElement> children = element.FindElements(By.XPath("select/x"));
        Assert.That(children, Is.Empty);
    }

    [Test]
    public void FindElementByName()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));
        IWebElement child = element.FindElement(By.Name("selectomatic"));
        Assert.That(child.GetAttribute("id"), Is.EqualTo("2"));
    }

    [Test]
    public void FindElementsByName()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));

        ReadOnlyCollection<IWebElement> children = element.FindElements(By.Name("selectomatic"));
        Assert.That(children, Has.Exactly(2).Items);
    }

    [Test]
    public void FindElementById()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));

        IWebElement child = element.FindElement(By.Id("2"));
        Assert.That(child.GetAttribute("name"), Is.EqualTo("selectomatic"));
    }


    [Test]
    public void FindElementByIdWhenMultipleMatchesExist()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Id("test_id_div"));

        IWebElement child = element.FindElement(By.Id("test_id"));
        Assert.That(child.Text, Is.EqualTo("inside"));
    }

    [Test]
    public void FindElementByIdWhenIdContainsNonAlphanumericCharacters()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Id("test_special_chars"));

        IWebElement childWithSpaces = element.FindElement(By.Id("white space"));
        Assert.That(childWithSpaces.Text, Does.Contain("space"));
        IWebElement childWithCssChars = element.FindElement(By.Id("css#.chars"));
        Assert.That(childWithCssChars.Text, Is.EqualTo("css escapes"));
    }

    [Test]
    public void FindElementByIdWhenNoMatchInContext()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Id("test_id_div"));

        Assert.That(
            () => element.FindElement(By.Id("test_id_out")),
            Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindElementsById()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("form2"));
        ReadOnlyCollection<IWebElement> children = element.FindElements(By.Id("2"));
        Assert.That(children, Has.Exactly(2).Items);
    }

    [Test]
    public void FindElementsByIdWithNonAlphanumericCharacters()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Id("test_special_chars"));
        ReadOnlyCollection<IWebElement> children = element.FindElements(By.Id("white space"));
        Assert.That(children, Has.One.Items);
        ReadOnlyCollection<IWebElement> children2 = element.FindElements(By.Id("css#.chars"));
        Assert.That(children2, Has.One.Items);
    }

    [Test]
    public void FindElementByLinkText()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("div1"));

        IWebElement child = element.FindElement(By.LinkText("hello world"));
        Assert.That(child.GetAttribute("name"), Is.EqualTo("link1"));
    }


    [Test]
    public void FindElementsByLinkText()
    {
        driver.Url = nestedPage;
        IWebElement element = driver.FindElement(By.Name("div1"));
        ReadOnlyCollection<IWebElement> elements = element.FindElements(By.LinkText("hello world"));

        Assert.That(elements, Has.Exactly(2).Items);
        Assert.That(elements[0].GetAttribute("name"), Is.EqualTo("link1"));
        Assert.That(elements[1].GetAttribute("name"), Is.EqualTo("link2"));
    }

    [Test]
    public void ShouldFindChildElementsById()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Id("test_id_div"));

        IWebElement element = parent.FindElement(By.Id("test_id"));
        Assert.That(element.Text, Is.EqualTo("inside"));
    }

    [Test]
    public void ShouldNotReturnRootElementWhenFindingChildrenById()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Id("test_id"));

        Assert.That(parent.FindElements(By.Id("test_id")), Is.Empty);
        Assert.That(
            () => parent.FindElement(By.Id("test_id")),
            Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldFindChildElementsByClassName()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("classes"));

        IWebElement element = parent.FindElement(By.ClassName("one"));

        Assert.That(element.Text, Is.EqualTo("Find me"));
    }

    [Test]
    public void ShouldFindChildrenByClassName()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("classes"));

        ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.ClassName("one"));

        Assert.That(elements, Has.Exactly(2).Items);
    }


    [Test]
    public void ShouldFindChildElementsByTagName()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("div1"));

        IWebElement element = parent.FindElement(By.TagName("a"));

        Assert.That(element.GetAttribute("name"), Is.EqualTo("link1"));
    }


    [Test]
    public void ShouldFindChildrenByTagName()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("div1"));

        ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.TagName("a"));

        Assert.That(elements, Has.Exactly(2).Items);
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByCssSelector()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("form2"));

        IWebElement element = parent.FindElement(By.CssSelector("*[name=\"selectomatic\"]"));

        Assert.That(element.GetAttribute("id"), Is.EqualTo("2"));
    }

    [Test]
    public void ShouldBeAbleToFindAnElementByCss3Selector()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("form2"));

        IWebElement element = parent.FindElement(By.CssSelector("*[name^=\"selecto\"]"));

        Assert.That(element.GetAttribute("id"), Is.EqualTo("2"));
    }

    [Test]
    public void ShouldBeAbleToFindElementsByCssSelector()
    {
        driver.Url = nestedPage;
        IWebElement parent = driver.FindElement(By.Name("form2"));

        ReadOnlyCollection<IWebElement> elements = parent.FindElements(By.CssSelector("*[name=\"selectomatic\"]"));

        Assert.That(elements, Has.Exactly(2).Items);
    }

    [Test]
    public void ShouldBeAbleToFindChildrenOfANode()
    {
        driver.Url = selectableItemsPage;
        ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("/html/head"));
        IWebElement head = elements[0];

        ReadOnlyCollection<IWebElement> importedScripts = head.FindElements(By.TagName("script"));
        Assert.That(importedScripts, Has.Exactly(3).Items);
    }

    [Test]
    public void ReturnAnEmptyListWhenThereAreNoChildrenOfANode()
    {
        driver.Url = xhtmlTestPage;
        IWebElement table = driver.FindElement(By.Id("table"));

        ReadOnlyCollection<IWebElement> rows = table.FindElements(By.TagName("tr"));
        Assert.That(rows, Is.Empty);
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
        Assert.That(
            () => element.FindElement(By.Name("x")),
            Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void FindingByTagNameShouldNotIncludeParentElementIfSameTagType()
    {
        driver.Url = xhtmlTestPage;
        IWebElement parent = driver.FindElement(By.Id("my_span"));

        Assert.That(parent.FindElements(By.TagName("div")), Has.Exactly(2).Items);
        Assert.That(parent.FindElements(By.TagName("span")), Has.Exactly(2).Items);
    }

    [Test]
    public void FindingByCssShouldNotIncludeParentElementIfSameTagType()
    {
        driver.Url = xhtmlTestPage;
        IWebElement parent = driver.FindElement(By.CssSelector("div#parent"));
        IWebElement child = parent.FindElement(By.CssSelector("div"));

        Assert.That(child.GetAttribute("id"), Is.EqualTo("child"));
    }

    [Test]
    public void FindMultipleElements()
    {
        driver.Url = simpleTestPage;
        IWebElement elem = driver.FindElement(By.Id("links"));

        ReadOnlyCollection<IWebElement> elements = elem.FindElements(By.PartialLinkText("link"));
        Assert.That(elements, Is.Not.Null);
        Assert.That(elements, Has.Exactly(6).Items);
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "Safari does not trim")]
    public void LinkWithLeadingSpaces()
    {
        driver.Url = simpleTestPage;
        IWebElement elem = driver.FindElement(By.Id("links"));

        IWebElement res = elem.FindElement(By.PartialLinkText("link with leading space"));
        Assert.That(res.Text, Is.EqualTo("link with leading space"));
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "Safari does not trim")]
    public void LinkWithTrailingSpace()
    {
        driver.Url = simpleTestPage;
        IWebElement elem = driver.FindElement(By.Id("links"));

        IWebElement res = elem.FindElement(By.PartialLinkText("link with trailing space"));
        Assert.That(res.Text, Is.EqualTo("link with trailing space"));
    }

    [Test]
    public void ElementCanGetLinkByLinkTestIgnoringTrailingWhitespace()
    {
        driver.Url = simpleTestPage;
        IWebElement elem = driver.FindElement(By.Id("links"));

        IWebElement link = elem.FindElement(By.LinkText("link with trailing space"));
        Assert.That(link.GetAttribute("id"), Is.EqualTo("linkWithTrailingSpace"));
    }
}
