using System;
using System.Collections.Generic;
using System.Text;
using NMock2;
using NUnit.Framework;
using System.Collections;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.Events
{
    [TestFixture]
    public class EventFiringWebDriverTest
    {
        private Mockery mocks;
        private IWebDriver mockDriver;
        private IWebElement mockElement;
        private INavigation mockNavigation;
        private StringBuilder log;

        [SetUp]
        public void Setup()
        {
            mocks = new Mockery();
            mockDriver = mocks.NewMock<IWebDriver>();
            mockElement = mocks.NewMock<IWebElement>();
            mockNavigation = mocks.NewMock<INavigation>();
            log = new StringBuilder();
        }

        [Test]
        public void ShouldFireNavigationEvents()
        {
            Expect.Once.On(mockDriver).SetProperty("Url").To("http://www.get.com");
            Expect.Exactly(3).On(mockDriver).Method("Navigate").Will(Return.Value(mockNavigation));
            Expect.Once.On(mockNavigation).Method("GoToUrl").With("http://www.navigate-to.com");
            Expect.Once.On(mockNavigation).Method("Back");
            Expect.Once.On(mockNavigation).Method("Forward");

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver);
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
            Assert.AreEqual(expectedLog, log.ToString());
        }

        [Test]
        public void ShouldFireClickEvent()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Name("foo")).Will(Return.Value(mockElement));
            Expect.Once.On(mockElement).Method("Click");

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver);
            firingDriver.ElementClicking += new EventHandler<WebElementEventArgs>(firingDriver_ElementClicking);
            firingDriver.ElementClicked += new EventHandler<WebElementEventArgs>(firingDriver_ElementClicked);

            firingDriver.FindElement(By.Name("foo")).Click();

            string expectedLog = @"Clicking
Clicked
";
            Assert.AreEqual(expectedLog, log.ToString());
        }

        [Test]
        public void ShouldFireFindByEvent()
        {
            IList<IWebElement> driverElements = new List<IWebElement>();
            IList<IWebElement> subElements = new List<IWebElement>();
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Id("foo")).Will(Return.Value(mockElement));
            Expect.Once.On(mockElement).Method("FindElement").With(By.LinkText("bar"));
            Expect.Once.On(mockElement).Method("FindElements").With(By.Name("xyz")).Will(Return.Value(new ReadOnlyCollection<IWebElement>(driverElements)));
            Expect.Once.On(mockDriver).Method("FindElements").With(By.XPath("//link[@type = 'text/css']")).Will(Return.Value(new ReadOnlyCollection<IWebElement>(subElements)));

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver);
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
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Id("foo")).Will(Throw.Exception(exception));

            EventFiringWebDriver firingDriver = new EventFiringWebDriver(mockDriver);
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
            IExecutingDriver executingDriver = mocks.NewMock<IExecutingDriver>();
            Expect.Once.On(executingDriver).Method("FindElement").With(By.Id("foo")).Will(Return.Value(mockElement));
            Expect.Once.On(executingDriver).Method("ExecuteScript").With("foo", new[] { mockElement }).Will(Return.Value("foo"));

            EventFiringWebDriver testedDriver = new EventFiringWebDriver(executingDriver);

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
            mockDriver = new StubDriver();
            EventFiringWebDriver testDriver = new EventFiringWebDriver(mockDriver);
            StubDriver wrapped = ((IWrapsDriver)testDriver).WrappedDriver as StubDriver;
            Assert.AreEqual(mockDriver, wrapped);
            testDriver.Navigating += new EventHandler<WebDriverNavigationEventArgs>(testDriver_Navigating);

            testDriver.Url = "http://example.org";
        }

        void testDriver_Navigating(object sender, WebDriverNavigationEventArgs e)
        {
            Assert.AreEqual(e.Driver, mockDriver);
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
