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
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
        public void CanAcceptUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.AcceptAndNotify, "This is a default value");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
        public void CanSilentlyAcceptUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Accept, "This is a default value");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
        public void CanDismissUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.DismissAndNotify, "null");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
        public void CanSilentlyDismissUnhandledAlert()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Dismiss, "null");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
        public void CanDismissUnhandledAlertsByDefault()
        {
            ExecuteTestWithUnhandledPrompt(UnhandledPromptBehavior.Default, "null");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Test issue, Safari driver does not support multiple simultaneous instances")]
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
            localDriver.FindElement(By.Id("prompt-with-default")).Click();

            WaitFor(ElementTextToBeEqual("text", expectedAlertText, silentlyHandlePrompt), "Did not find text");
        }

        private Func<bool> ElementTextToBeEqual(string elementId, string expectedAlertText, bool silentlyHandlePrompt)
        {
            return () =>
            {
                try
                {
                    return localDriver.FindElement(By.Id(elementId)).Text == expectedAlertText;
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

