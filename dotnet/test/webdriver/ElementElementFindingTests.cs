// <copyright file="ElementElementFindingTests.cs" company="Selenium Committers">
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

// TODO(andre.nogueira): Find better name. This class is to distinguish
// finding elements in the driver (whole page), and inside other elements
[TestFixture]
public class ElementElementFindingTests : DriverTestFixture
{
    #region FindElemement Tests

    [Test]
    public void ShouldFindElementById()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Id("test_id_div"));
        IWebElement child = parent.FindElement(By.Id("test_id"));
        Assert.That(child.Text, Is.EqualTo("inside"));
    }

    [Test]
    public void ShouldFindElementByLinkText()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("div1"));
        IWebElement child = parent.FindElement(By.PartialLinkText("hello world"));
        Assert.That(child.Text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldFindElementByName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("div1"));
        IWebElement child = parent.FindElement(By.Name("link1"));
        Assert.That(child.Text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldFindElementByXPath()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Id("test_id_div"));
        IWebElement child = parent.FindElement(By.XPath("p"));
        Assert.That(child.Text, Is.EqualTo("inside"));
    }

    [Test]
    public void ShouldFindElementByClassName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("classes"));
        IWebElement child = parent.FindElement(By.ClassName("oneother"));
        Assert.That(child.Text, Is.EqualTo("But not me"));
    }

    [Test]
    public void ShouldFindElementByPartialLinkText()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("div1"));
        IWebElement child = parent.FindElement(By.PartialLinkText(" world"));
        Assert.That(child.Text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldFindElementByTagName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Id("test_id_div"));
        IWebElement child = parent.FindElement(By.TagName("p"));
        Assert.That(child.Text, Is.EqualTo("inside"));
    }
    #endregion

    #region FindElemements Tests

    [Test]
    public void ShouldFindElementsById()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("form2"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Id("2"));
        Assert.That(children, Has.Count.EqualTo(2));
    }

    [Test]
    public void ShouldFindElementsByLinkText()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("div1"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello world"));
        Assert.That(children, Has.Count.EqualTo(2));
        Assert.That(children[0].Text, Is.EqualTo("hello world"));
        Assert.That(children[1].Text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldFindElementsByName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("form2"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Name("selectomatic"));
        Assert.That(children, Has.Count.EqualTo(2));
    }

    [Test]
    public void ShouldFindElementsByXPath()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("classes"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("span"));
        Assert.That(children, Has.Count.EqualTo(3));
        Assert.That(children[0].Text, Is.EqualTo("Find me"));
        Assert.That(children[1].Text, Is.EqualTo("Also me"));
        Assert.That(children[2].Text, Is.EqualTo("But not me"));
    }

    [Test]
    public void ShouldFindElementsByClassName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("classes"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.ClassName("one"));
        Assert.That(children, Has.Count.EqualTo(2));
        Assert.That(children[0].Text, Is.EqualTo("Find me"));
        Assert.That(children[1].Text, Is.EqualTo("Also me"));
    }

    [Test]
    public void ShouldFindElementsByPartialLinkText()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("div1"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello "));
        Assert.That(children, Has.Count.EqualTo(2));
        Assert.That(children[0].Text, Is.EqualTo("hello world"));
        Assert.That(children[1].Text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldFindElementsByTagName()
    {
        Driver.Url = Urls.NestedPage;
        IWebElement parent = Driver.FindElement(By.Name("classes"));
        ReadOnlyCollection<IWebElement> children = parent.FindElements(By.TagName("span"));
        Assert.That(children, Has.Count.EqualTo(3));
        Assert.That(children[0].Text, Is.EqualTo("Find me"));
        Assert.That(children[1].Text, Is.EqualTo("Also me"));
        Assert.That(children[2].Text, Is.EqualTo("But not me"));
    }

    #endregion
}
