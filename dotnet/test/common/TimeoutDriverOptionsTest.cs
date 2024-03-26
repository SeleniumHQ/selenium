using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TimeoutDriverOptionsTest
    {
        private IWebDriver driver;

        private readonly TimeSpan defaultScriptTimeout = TimeSpan.FromMilliseconds(30_000);
        private readonly TimeSpan defaultPageLoadTimeout = TimeSpan.FromMilliseconds(300_000);
        private readonly TimeSpan defaultImplicitWaitTimeout = TimeSpan.Zero;

        [TearDown]
        public void TearDown()
        {
            driver?.Quit();
        }

        [Test]
        public void CanSetScriptTimeout()
        {
            var expectedScriptTimeout = TimeSpan.FromSeconds(5);

            var options = new TestDriverOptions()
            {
                ScriptTimeout = expectedScriptTimeout,
            };

            Assert.That(options.ScriptTimeout, Is.EqualTo(expectedScriptTimeout));
            Assert.That(options.PageLoadTimeout, Is.Null);
            Assert.That(options.ImplicitWaitTimeout, Is.Null);

            driver = EnvironmentManager.Instance.CreateDriverInstance(options);

            Assert.That(driver.Manage().Timeouts().AsynchronousJavaScript, Is.EqualTo(expectedScriptTimeout));

            // other timeout options are still default
            Assert.That(driver.Manage().Timeouts().PageLoad, Is.EqualTo(defaultPageLoadTimeout));
            Assert.That(driver.Manage().Timeouts().ImplicitWait, Is.EqualTo(defaultImplicitWaitTimeout));
        }

        [Test]
        public void CanSetPageLoadTimeout()
        {
            var expectedPageLoadTimeout = TimeSpan.FromSeconds(5);

            var options = new TestDriverOptions()
            {
                PageLoadTimeout = expectedPageLoadTimeout,
            };

            Assert.That(options.PageLoadTimeout, Is.EqualTo(expectedPageLoadTimeout));
            Assert.That(options.ScriptTimeout, Is.Null);
            Assert.That(options.ImplicitWaitTimeout, Is.Null);

            driver = EnvironmentManager.Instance.CreateDriverInstance(options);

            Assert.That(driver.Manage().Timeouts().PageLoad, Is.EqualTo(expectedPageLoadTimeout));

            // other timeout options are still default
            Assert.That(driver.Manage().Timeouts().AsynchronousJavaScript, Is.EqualTo(defaultScriptTimeout));
            Assert.That(driver.Manage().Timeouts().ImplicitWait, Is.EqualTo(defaultImplicitWaitTimeout));
        }

        [Test]
        public void CanSetImplicitWaitTimeout()
        {
            var expectedImplicitWaitTimeout = TimeSpan.FromSeconds(5);

            var options = new TestDriverOptions()
            {
                ImplicitWaitTimeout = expectedImplicitWaitTimeout,
            };

            Assert.That(options.ImplicitWaitTimeout, Is.EqualTo(expectedImplicitWaitTimeout));
            Assert.That(options.ScriptTimeout, Is.Null);
            Assert.That(options.PageLoadTimeout, Is.Null);

            driver = EnvironmentManager.Instance.CreateDriverInstance(options);

            Assert.That(driver.Manage().Timeouts().ImplicitWait, Is.EqualTo(expectedImplicitWaitTimeout));

            // other timeout options are still default
            Assert.That(driver.Manage().Timeouts().AsynchronousJavaScript, Is.EqualTo(defaultScriptTimeout));
            Assert.That(driver.Manage().Timeouts().PageLoad, Is.EqualTo(defaultPageLoadTimeout));
        }
        [Test]
        public void CanSetTimeout()
        {
            var expectedScriptTimeout = TimeSpan.FromSeconds(3);
            var expectedPageLoadTimeout = TimeSpan.FromSeconds(4);
            var expectedImplicitWaitTimeout = TimeSpan.FromSeconds(5);

            var options = new TestDriverOptions()
            {
                ScriptTimeout = expectedScriptTimeout,
                PageLoadTimeout = expectedPageLoadTimeout,
                ImplicitWaitTimeout = expectedImplicitWaitTimeout,
            };

            Assert.That(options.ScriptTimeout, Is.EqualTo(expectedScriptTimeout));
            Assert.That(options.PageLoadTimeout, Is.EqualTo(expectedPageLoadTimeout));
            Assert.That(options.ImplicitWaitTimeout, Is.EqualTo(expectedImplicitWaitTimeout));

            driver = EnvironmentManager.Instance.CreateDriverInstance(options);

            Assert.That(driver.Manage().Timeouts().AsynchronousJavaScript, Is.EqualTo(expectedScriptTimeout));
            Assert.That(driver.Manage().Timeouts().PageLoad, Is.EqualTo(expectedPageLoadTimeout));
            Assert.That(driver.Manage().Timeouts().ImplicitWait, Is.EqualTo(expectedImplicitWaitTimeout));
        }

        class TestDriverOptions : DriverOptions
        {
            public override ICapabilities ToCapabilities()
            {
                return null;
            }
        }
    }
}
