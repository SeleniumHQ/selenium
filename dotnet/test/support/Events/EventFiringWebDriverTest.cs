// <copyright file="EventFiringWebDriverTest.cs" company="Selenium Committers">
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
using System.Text;

namespace OpenQA.Selenium.Support.Events;

[TestFixture]
public class EventFiringWebDriverTest
{
    private Mock<IWebDriver> mockDriver;
    private Mock<IWebElement> mockElement;
    private Mock<ISearchContext> mockShadowRoot;
    private Mock<INavigation> mockNavigation;
    private IWebDriver stubDriver;
    private StringBuilder log;

    [SetUp]
    public void Setup()
    {
        mockDriver = new Mock<IWebDriver>();
        mockElement = new Mock<IWebElement>()
        {
            DefaultValue = DefaultValue.Mock
        };
        mockShadowRoot = new Mock<ISearchContext>()
        {
            DefaultValue = DefaultValue.Mock
        };
        mockNavigation = new Mock<INavigation>();
        log = new StringBuilder();
    }

    [Test]
    public void ShouldFireNavigationEvents()
    {
        mockDriver.SetupSet(_ => _.Url = It.Is<string>(x => x == "http://www.get.com"));
        mockDriver.Setup(_ => _.Navigate()).Returns(mockNavigation.Object);
        mockNavigation.Setup(_ => _.GoToUrl(It.Is<string>(x => x == "http://www.navigate-to.com")));
        mockNavigation.Setup(_ => _.Back());
        mockNavigation.Setup(_ => _.Forward());

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        firingDriver.Navigating += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_Navigating);
        firingDriver.Navigated += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_Navigated);
        firingDriver.NavigatingBack += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_NavigatingBack);
        firingDriver.NavigatedBack += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_NavigatedBack);
        firingDriver.NavigatingForward += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_NavigatingForward);
        firingDriver.NavigatedForward += new EventHandler<WebDriverNavigationEventArgs>(firingDriver_NavigatedForward);

        firingDriver.Url = "http://www.get.com";
        firingDriver.Navigate().GoToUrl("http://www.navigate-to.com");
        firingDriver.Navigate().Back();
        firingDriver.Navigate().Forward();

        string expectedLog = @"Navigating http://www.get.com
Navigated http://www.get.com
Navigating http://www.navigate-to.com
Navigated http://www.navigate-to.com
Navigating back
Navigated back
Navigating forward
Navigated forward
";
        string normalizedExpectedLog = expectedLog.Replace("\r\n", "\n").Replace("\r", "\n");
        mockDriver.VerifySet(x => x.Url = "http://www.get.com", Times.Once);
        mockDriver.Verify(x => x.Navigate(), Times.Exactly(3));
        mockNavigation.Verify(x => x.GoToUrlAsync("http://www.navigate-to.com"), Times.Once);
        mockNavigation.Verify(x => x.BackAsync(), Times.Once);
        mockNavigation.Verify(x => x.ForwardAsync(), Times.Once);

        string normalizedActualLog = log.ToString().Replace("\r\n", "\n").Replace("\r", "\n");
        Assert.That(normalizedActualLog, Is.EqualTo(normalizedExpectedLog));
    }

    [Test]
    public void ShouldFireClickEvent()
    {
        mockDriver.Setup(_ => _.FindElement(It.IsAny<By>())).Returns(mockElement.Object);
        mockElement.Setup(_ => _.Click());

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        firingDriver.ElementClicking += new EventHandler<WebElementEventArgs>(firingDriver_ElementClicking);
        firingDriver.ElementClicked += new EventHandler<WebElementEventArgs>(firingDriver_ElementClicked);

        firingDriver.FindElement(By.Name("foo")).Click();

        string expectedLog = @"Clicking
Clicked
";
        Assert.That(log.ToString(), Is.EqualTo(expectedLog));
    }

    [Test]
    public void ShouldFireValueChangedEvent()
    {
        mockDriver.Setup(_ => _.FindElement(It.IsAny<By>())).Returns(mockElement.Object);
        mockElement.Setup(_ => _.Clear());
        mockElement.Setup(_ => _.SendKeys(It.IsAny<string>()));

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        firingDriver.ElementValueChanging += (sender, e) => log.AppendFormat("ValueChanging '{0}'", e.Value).AppendLine();
        firingDriver.ElementValueChanged += (sender, e) => log.AppendFormat("ValueChanged '{0}'", e.Value).AppendLine();

        var element = firingDriver.FindElement(By.Name("foo"));
        element.Clear();
        element.SendKeys("Dummy Text");

        string expectedLog = @"ValueChanging ''
ValueChanged ''
ValueChanging 'Dummy Text'
ValueChanged 'Dummy Text'
";
        Assert.That(log.ToString(), Is.EqualTo(expectedLog));
    }

    [Test]
    public void ElementsCanEqual()
    {
        mockDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Returns(mockElement.Object);

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        var element1 = firingDriver.FindElement(By.Id("foo"));
        var element2 = firingDriver.FindElement(By.Id("foo"));

        Assert.That(element2, Is.EqualTo(element1));
    }

    [Test]
    public void ShouldFireFindByEvent()
    {
        IList<IWebElement> driverElements = new List<IWebElement>();
        IList<IWebElement> subElements = new List<IWebElement>();
        Mock<IWebElement> ignored = new Mock<IWebElement>();

        mockDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Returns(mockElement.Object);
        mockElement.Setup(_ => _.FindElement(It.IsAny<By>())).Returns(ignored.Object);
        mockElement.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("xyz"))))).Returns(new ReadOnlyCollection<IWebElement>(driverElements));
        mockDriver.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.XPath("//link[@type = 'text/css']"))))).Returns(new ReadOnlyCollection<IWebElement>(subElements));

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        firingDriver.FindingElement += new EventHandler<FindElementEventArgs>(firingDriver_FindingElement);
        firingDriver.FindElementCompleted += new EventHandler<FindElementEventArgs>(firingDriver_FindElementCompleted);

        IWebElement element = firingDriver.FindElement(By.Id("foo"));
        element.FindElement(By.LinkText("bar"));
        element.FindElements(By.Name("xyz"));
        firingDriver.FindElements(By.XPath("//link[@type = 'text/css']"));

        string expectedLog = @"FindingElement from IWebDriver By.Id: foo
FindElementCompleted from IWebDriver By.Id: foo
FindingElement from IWebElement By.LinkText: bar
FindElementCompleted from IWebElement By.LinkText: bar
FindingElement from IWebElement By.Name: xyz
FindElementCompleted from IWebElement By.Name: xyz
FindingElement from IWebDriver By.XPath: //link[@type = 'text/css']
FindElementCompleted from IWebDriver By.XPath: //link[@type = 'text/css']
";

        Assert.That(log.ToString(), Is.EqualTo(expectedLog));
    }

    [Test]
    public void ShouldCallListenerOnException()
    {
        NoSuchElementException exception = new NoSuchElementException("argh");
        mockDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Throws(exception);

        EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
        firingDriver.ExceptionThrown += new EventHandler<WebDriverExceptionEventArgs>(firingDriver_ExceptionThrown);

        Assert.That(
            () => firingDriver.FindElement(By.Id("foo")),
            Throws.InstanceOf<NoSuchElementException>());

        Assert.That(log.ToString(), Does.Contain(exception.Message));
    }

    [Test]
    public void ShouldUnwrapElementArgsWhenCallingScripts()
    {
        Mock<IExecutingDriver> executingDriver = new Mock<IExecutingDriver>();
        executingDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Returns(mockElement.Object);
        executingDriver.Setup(_ => _.ExecuteScript(It.IsAny<string>(), It.IsAny<object[]>())).Returns("foo");

        EventFiringWebDriver testedDriver = new EventFiringWebDriver(executingDriver.Object);

        IWebElement element = testedDriver.FindElement(By.Id("foo"));
        try
        {
            testedDriver.ExecuteScript("foo", element);
        }
        catch (Exception)
        {
            // This is the error we're trying to fix
            throw;
        }
    }

    [Test]
    public void ShouldBeAbleToWrapSubclassesOfSomethingImplementingTheWebDriverInterface()
    {
        // We should get this far
        EventFiringWebDriver testDriver = new EventFiringWebDriver(new ChildDriver());
    }

    [Test]
    public void ShouldBeAbleToAccessWrappedInstanceFromEventCalls()
    {
        stubDriver = new StubDriver();
        EventFiringWebDriver testDriver = new EventFiringWebDriver(stubDriver);
        StubDriver wrapped = ((IWrapsDriver)testDriver).WrappedDriver as StubDriver;
        Assert.That(wrapped, Is.EqualTo(stubDriver));
        testDriver.Navigating += new EventHandler<WebDriverNavigationEventArgs>(testDriver_Navigating);

        testDriver.Url = "http://example.org";
    }

    [Test]
    public void ShouldFireGetShadowRootEvents()
    {
        mockDriver.Setup(d => d.FindElement(It.IsAny<By>())).Returns(mockElement.Object);
        EventFiringWebDriver testDriver = new EventFiringWebDriver(mockDriver.Object);

        GetShadowRootEventArgs gettingShadowRootArgs = null;
        GetShadowRootEventArgs getShadowRootCompletedArgs = null;
        testDriver.GettingShadowRoot += (d, e) => gettingShadowRootArgs = e;
        testDriver.GetShadowRootCompleted += (d, e) => getShadowRootCompletedArgs = e;

        var abcElement = testDriver.FindElement(By.CssSelector(".abc"));

        // act
        abcElement.GetShadowRoot();

        Assert.That(gettingShadowRootArgs, Is.Not.Null);
        Assert.That(gettingShadowRootArgs.Driver, Is.EqualTo(mockDriver.Object));
        Assert.That(gettingShadowRootArgs.SearchContext, Is.EqualTo(mockElement.Object));

        Assert.That(getShadowRootCompletedArgs, Is.Not.Null);
        Assert.That(getShadowRootCompletedArgs.Driver, Is.EqualTo(mockDriver.Object));
        Assert.That(getShadowRootCompletedArgs.SearchContext, Is.EqualTo(mockElement.Object));
    }

    [Test]
    public void ShouldFireFindEventsInShadowRoot()
    {
        mockElement.Setup(e => e.GetShadowRoot()).Returns(mockShadowRoot.Object);
        mockElement.Setup(e => e.FindElement(It.IsAny<By>())).Returns(mockElement.Object);
        mockDriver.Setup(d => d.FindElement(It.IsAny<By>())).Returns(mockElement.Object);
        EventFiringWebDriver testDriver = new EventFiringWebDriver(mockDriver.Object);

        FindElementEventArgs findingElementArgs = null;
        FindElementEventArgs findElementCompletedArgs = null;
        testDriver.FindingElement += (d, e) => findingElementArgs = e;
        testDriver.FindElementCompleted += (d, e) => findElementCompletedArgs = e;

        var abcElement = testDriver.FindElement(By.CssSelector(".abc"));
        var shadowRoot = abcElement.GetShadowRoot();

        // act
        var element = shadowRoot.FindElement(By.CssSelector(".abc"));

        Assert.That(findingElementArgs, Is.Not.Null);
        Assert.That(findingElementArgs.Driver, Is.EqualTo(mockDriver.Object));
        Assert.That(findingElementArgs.Element, Is.Null);

        Assert.That(findElementCompletedArgs, Is.Not.Null);
        Assert.That(findElementCompletedArgs.Driver, Is.EqualTo(mockDriver.Object));
        Assert.That(findElementCompletedArgs.Element, Is.Null);
    }

    void testDriver_Navigating(object sender, WebDriverNavigationEventArgs e)
    {
        Assert.That(stubDriver, Is.EqualTo(e.Driver));
    }

    void firingDriver_ExceptionThrown(object sender, WebDriverExceptionEventArgs e)
    {
        log.AppendLine(e.ThrownException.Message);
    }

    void firingDriver_FindingElement(object sender, FindElementEventArgs e)
    {
        log.Append("FindingElement from ").Append(e.Element == null ? "IWebDriver " : "IWebElement ").AppendLine(e.FindMethod.ToString());
    }

    void firingDriver_FindElementCompleted(object sender, FindElementEventArgs e)
    {
        log.Append("FindElementCompleted from ").Append(e.Element == null ? "IWebDriver " : "IWebElement ").AppendLine(e.FindMethod.ToString());
    }

    void firingDriver_ElementClicking(object sender, WebElementEventArgs e)
    {
        log.AppendLine("Clicking");
    }

    void firingDriver_ElementClicked(object sender, WebElementEventArgs e)
    {
        log.AppendLine("Clicked");
    }

    void firingDriver_Navigating(object sender, WebDriverNavigationEventArgs e)
    {
        log.Append("Navigating ").Append(e.Url).AppendLine();
    }

    void firingDriver_Navigated(object sender, WebDriverNavigationEventArgs e)
    {
        log.Append("Navigated ").Append(e.Url).AppendLine();
    }

    void firingDriver_NavigatingBack(object sender, WebDriverNavigationEventArgs e)
    {
        log.AppendLine("Navigating back");
    }

    void firingDriver_NavigatedBack(object sender, WebDriverNavigationEventArgs e)
    {
        log.AppendLine("Navigated back");
    }

    void firingDriver_NavigatingForward(object sender, WebDriverNavigationEventArgs e)
    {
        log.AppendLine("Navigating forward");
    }

    void firingDriver_NavigatedForward(object sender, WebDriverNavigationEventArgs e)
    {
        log.AppendLine("Navigated forward");
    }

    public interface IExecutingDriver : IWebDriver, IJavaScriptExecutor
    {
    }

    public class ChildDriver : StubDriver
    {
    }
}
