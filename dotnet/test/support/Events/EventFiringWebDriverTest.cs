using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;
using Moq;

namespace OpenQA.Selenium.Support.Events
{
    [TestFixture]
    public class EventFiringWebDriverTest
    {
        private Mock<IWebDriver> mockDriver;
        private Mock<IWebElement> mockElement;
        private Mock<INavigation> mockNavigation;
        private IWebDriver stubDriver;
        private StringBuilder log;

        [SetUp]
        public void Setup()
        {
            mockDriver = new Mock<IWebDriver>();
            mockElement = new Mock<IWebElement>();
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
            mockDriver.VerifySet(x => x.Url = "http://www.get.com", Times.Once);
            mockDriver.Verify(x => x.Navigate(), Times.Exactly(3));
            mockNavigation.Verify(x => x.GoToUrl("http://www.navigate-to.com"), Times.Once);
            mockNavigation.Verify(x => x.Back(), Times.Once);
            mockNavigation.Verify(x => x.Forward(), Times.Once);
            Assert.AreEqual(expectedLog, log.ToString());
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
            Assert.AreEqual(expectedLog, log.ToString());
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
            Assert.AreEqual(expectedLog, log.ToString());
        }

        [Test]
        public void ElementsCanEqual()
        {
            mockDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Returns(mockElement.Object);

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
            var element1 = firingDriver.FindElement(By.Id("foo"));
            var element2 = firingDriver.FindElement(By.Id("foo"));

            Assert.AreEqual(element1, element2);
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

            Assert.AreEqual(expectedLog, log.ToString());
        }

        [Test]
        public void ShouldCallListenerOnException()
        {
            NoSuchElementException exception = new NoSuchElementException("argh");
            mockDriver.Setup(_ => _.FindElement(It.Is<By>(x => x.Equals(By.Id("foo"))))).Throws(exception);

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver.Object);
            firingDriver.ExceptionThrown += new EventHandler<WebDriverExceptionEventArgs>(firingDriver_ExceptionThrown);

            try
            {
                firingDriver.FindElement(By.Id("foo"));
                Assert.Fail("Expected exception to be propogated");
            }
            catch (NoSuchElementException)
            {
                // Fine
            }

            Assert.IsTrue(log.ToString().Contains(exception.Message));
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
            catch (Exception e)
            {
                // This is the error we're trying to fix
                throw e;
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
            Assert.AreEqual(stubDriver, wrapped);
            testDriver.Navigating += new EventHandler<WebDriverNavigationEventArgs>(testDriver_Navigating);

            testDriver.Url = "http://example.org";
        }

        void testDriver_Navigating(object sender, WebDriverNavigationEventArgs e)
        {
            Assert.AreEqual(e.Driver, stubDriver);
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
}
