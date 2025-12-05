// <copyright file="SelectTests.cs" company="Selenium Committers">
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

using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Reflection;

namespace OpenQA.Selenium.Support.UI;

[TestFixture]
public class SelectTests
{
    private Mock<IWebElement> webElement;

    [SetUp]
    public void SetUp()
    {
        webElement = new Mock<IWebElement>();
    }

    [Test]
    public void ThrowUnexpectedTagNameExceptionWhenNotSelectTag()
    {
        webElement.SetupGet<string>(_ => _.TagName).Returns("form");
        Assert.That(
            () => new SelectElement(webElement.Object),
            Throws.TypeOf<UnexpectedTagNameException>());
    }

    [Test]
    public void CanCreateNewInstanceOfSelectWithNormalSelectElement()
    {
        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns((string)null);

        Assert.That(new SelectElement(webElement.Object).IsMultiple, Is.False);
    }

    [Test]
    public void CanCreateNewInstanceOfSelectWithMultipleSelectElement()
    {
        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");

        Assert.That(new SelectElement(webElement.Object).IsMultiple, Is.True);
    }

    [Test]
    public void CanGetListOfOptions()
    {
        IList<IWebElement> options = new List<IWebElement>();
        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options));

        Assert.That(new SelectElement(webElement.Object).Options, Is.EqualTo(options));
    }

    [Test]
    public void CanGetSingleSelectedOption()
    {
        Mock<IWebElement> selected = new Mock<IWebElement>();
        Mock<IWebElement> notSelected = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(notSelected.Object);
        options.Add(selected.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        notSelected.SetupGet<bool>(_ => _.Selected).Returns(false);
        selected.SetupGet<bool>(_ => _.Selected).Returns(true);
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        IWebElement option = new SelectElement(webElement.Object).SelectedOption;
        Assert.That(option, Is.EqualTo(selected.Object));
        notSelected.Verify(_ => _.Selected, Times.Once);
        selected.Verify(_ => _.Selected, Times.Once);
        webElement.Verify();
    }

    [Test]
    public void CanGetAllSelectedOptions()
    {
        Mock<IWebElement> selected = new Mock<IWebElement>();
        Mock<IWebElement> notSelected = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(selected.Object);
        options.Add(notSelected.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        notSelected.SetupGet<bool>(_ => _.Selected).Returns(false);
        selected.SetupGet<bool>(_ => _.Selected).Returns(true);
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        IList<IWebElement> returnedOption = new SelectElement(webElement.Object).AllSelectedOptions;
        Assert.That(returnedOption, Has.Count.EqualTo(1));
        Assert.That(returnedOption[0], Is.EqualTo(selected.Object));
        notSelected.Verify(_ => _.Selected, Times.Once);
        selected.Verify(_ => _.Selected, Times.Once);
        webElement.Verify();
    }

    [Test]
    public void CanSetSingleOptionSelectedByText()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByText("Select Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        webElement.Verify();
    }

    [Test]
    public void CanSetSingleOptionSelectedByValue()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns((string)null);
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByValue("Select Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        webElement.Verify();
    }

    [Test]
    public void CanSetSingleOptionSelectedByIndex()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns((string)null);
        option1.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("2");
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByIndex(2);
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        option1.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanSetMultipleOptionSelectedByText()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        option2.SetupGet<bool>(_ => _.Selected).Returns(false);
        option2.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByText("Select Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        option2.Verify(_ => _.Selected, Times.Once);
        option2.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanSetMultipleOptionSelectedByValue()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        option2.SetupGet<bool>(_ => _.Selected).Returns(false);
        option2.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByValue("Select Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        option2.Verify(_ => _.Selected, Times.Once);
        option2.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanSetMultipleOptionSelectedByIndex()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("1");
        option1.SetupGet<bool>(_ => _.Selected).Returns(false);
        option1.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option1.Setup(_ => _.Click());
        option2.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("2");
        option2.SetupGet<bool>(_ => _.Selected).Returns(false);
        option2.SetupGet<bool>(_ => _.Enabled).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).SelectByIndex(2);
        option1.Verify(_ => _.Selected, Times.Never);
        option1.Verify(_ => _.Click(), Times.Never);
        option1.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        option2.Verify(_ => _.Selected, Times.Once);
        option2.Verify(_ => _.Click(), Times.Once);
        option2.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanDeselectSingleOptionSelectedByText()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByText("Deselect Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanDeselectSingleOptionSelectedByValue()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByValue("Deselect Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanDeselectSingleOptionSelectedByIndex()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("2");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByIndex(2);
        option1.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanDeselectMultipleOptionSelectedByText()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        option2.SetupGet<bool>(_ => _.Selected).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByText("Deselect Me");
    }

    [Test]
    public void CanDeselectMultipleOptionSelectedByValue()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        option2.SetupGet<bool>(_ => _.Selected).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByValue("Deselect Me");
        option1.Verify(_ => _.Selected, Times.Once);
        option1.Verify(_ => _.Click(), Times.Once);
        option2.Verify(_ => _.Selected, Times.Once);
        option2.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void CanDeselectMultipleOptionSelectedByIndex()
    {
        Mock<IWebElement> option1 = new Mock<IWebElement>();
        Mock<IWebElement> option2 = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(option1.Object);
        options.Add(option2.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        option1.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("1");
        option1.SetupGet<bool>(_ => _.Selected).Returns(true);
        option1.Setup(_ => _.Click());
        option2.Setup<string>(_ => _.GetAttribute(It.IsAny<string>())).Returns("2");
        option2.SetupGet<bool>(_ => _.Selected).Returns(true);
        option2.Setup(_ => _.Click());
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        new SelectElement(webElement.Object).DeselectByIndex(2);
        option1.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        option1.Verify(_ => _.Selected, Times.Never);
        option1.Verify(_ => _.Click(), Times.Never);
        option2.Verify(_ => _.GetAttribute(It.IsAny<string>()), Times.Once);
        option2.Verify(_ => _.Selected, Times.Once);
        option2.Verify(_ => _.Click(), Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void SelectedOptionPropertyShouldThrowExceptionWhenNoOptionSelected()
    {
        Mock<IWebElement> selected = new Mock<IWebElement>();
        Mock<IWebElement> notSelected = new Mock<IWebElement>();
        IList<IWebElement> options = new List<IWebElement>();
        options.Add(notSelected.Object);

        webElement.SetupGet<string>(_ => _.TagName).Returns("select");
        webElement.Setup(_ => _.GetAttribute(It.Is<string>(x => x == "multiple"))).Returns("true");
        notSelected.SetupGet<bool>(_ => _.Selected).Returns(false);
        webElement.Setup(_ => _.FindElements(It.IsAny<By>())).Returns(new ReadOnlyCollection<IWebElement>(options)).Verifiable();

        SelectElement element = new SelectElement(webElement.Object);
        Assert.That(
            () => element.SelectedOption,
            Throws.TypeOf<NoSuchElementException>());

        notSelected.Verify(_ => _.Selected, Times.Once);
        webElement.Verify(_ => _.FindElements(It.IsAny<By>()), Times.Once);
    }

    [Test]
    public void ShouldConvertAnUnquotedStringIntoOneWithQuotes()
    {
        string result = EscapeQuotes("foo");

        Assert.That(result, Is.EqualTo("\"foo\""));
    }

    [Test]
    public void ShouldConvertAStringWithATickIntoOneWithQuotes()
    {
        string result = EscapeQuotes("f'oo");

        Assert.That(result, Is.EqualTo("\"f'oo\""));
    }

    [Test]
    public void ShouldConvertAStringWithAQuotIntoOneWithTicks()
    {
        string result = EscapeQuotes("f\"oo");

        Assert.That(result, Is.EqualTo("'f\"oo'"));
    }

    [Test]
    public void ShouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes()
    {
        string result = EscapeQuotes("f\"o'o");

        Assert.That(result, Is.EqualTo("concat(\"f\", '\"', \"o'o\")"));
    }

    /**
     * Tests that escapeQuotes returns concatenated strings when the given
     * string contains a tick and and ends with a quote.
     */
    [Test]
    public void ShouldProvideConcatenatedStringsWhenStringEndsWithQuote()
    {
        string result = EscapeQuotes("Bar \"Rock'n'Roll\"");

        Assert.That(result, Is.EqualTo("concat(\"Bar \", '\"', \"Rock'n'Roll\", '\"')"));
    }

    private string EscapeQuotes(string toEscape)
    {
        Type selectElementType = typeof(SelectElement);
        MethodInfo escapeQuotesMethod = selectElementType.GetMethod("EscapeQuotes", BindingFlags.Static | BindingFlags.NonPublic);
        string result = escapeQuotesMethod.Invoke(null, new object[] { toEscape }).ToString();
        return result;
    }
}
