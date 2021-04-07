using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class UnexpectedAlertBehaviorTest : DriverTestFixture
    {
        private IWebDriver localDriver;

        [SetUp]
        public void RestartOriginalDriver()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
        }

        [TearDown]
        public void QuitDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }

            EnvironmentManager.Instance.CreateFreshDriver();
        }

        [Test]
        public void CanAcceptUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.AcceptAndNotify, "This is a default value");
        }

        [Test]
        public void CanSilentlyAcceptUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Accept, "This is a default value");
        }

        [Test]
        public void CanDismissUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.DismissAndNotify, "null");
        }

        [Test]
        public void CanSilentlyDismissUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Dismiss, "null");
        }

        [Test]
        public void CanDismissUnhandledAlertsByDefault()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Default, "null");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test hangs waiting for alert acknowldegement in Safari, but works in Tech Preview")]
        public void CanIgnoreUnhandledAlert()
        {
            Assert.That(() => ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Ignore, "Text ignored"), Throws.InstanceOf<WebDriverException>().With.InnerException.InstanceOf<UnhandledAlertException>());
            localDriver.SwitchTo().Alert().Dismiss();
        }

        private void ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior behavior, string expectedAlertText)
        {
            bool silentlyHandlePrompt = behavior == UnhandledPromptBehavior.Accept || behavior == UnhandledPromptBehavior.Dismiss;
            UnhandledPromptBehaviorOptions options = new UnhandledPromptBehaviorOptions();
            if (behavior != UnhandledPromptBehavior.Default)
            {
                options.UnhandledPromptBehavior = behavior;
            }

            localDriver = EnvironmentManager.Instance.CreateDriverInstance(options);
            localDriver.Url = alertsPage;
            IWebElement resultElement = localDriver.FindElement(By.Id("text"));
            localDriver.FindElement(By.Id("prompt-with-default")).Click();

            WaitFor(ElementTextToBeEqual(resultElement, expectedAlertText, silentlyHandlePrompt), "Did not find text");
        }

        private Func<bool> ElementTextToBeEqual(IWebElement resultElement, string expectedAlertText, bool silentlyHandlePrompt)
        {
            return () =>
            {
                try
                {
                    return resultElement.Text == expectedAlertText;
                }
                catch (UnhandledAlertException e)
                {
                    if (!silentlyHandlePrompt)
                    {
                        throw e;
                    }
                }
                catch (NoSuchElementException)
                {
                }

                return false;
            };
        }

        public class UnhandledPromptBehaviorOptions : DriverOptions
        {
            [Obsolete]
            public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
            {
            }

            public override ICapabilities ToCapabilities()
            {
                return null;
            }
        }
    }
}

