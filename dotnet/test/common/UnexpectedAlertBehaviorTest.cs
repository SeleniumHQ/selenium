// <copyright file="UnexpectedAlertBehaviorTest.cs" company="Selenium Committers">
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
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium;

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
    [IgnoreBrowser(Browser.Safari, "Test hangs waiting for alert acknowledgement in Safari, but works in Tech Preview")]
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
            catch (UnhandledAlertException)
            {
                if (!silentlyHandlePrompt)
                {
                    throw;
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
        public override void AddAdditionalOption(string capabilityName, object capabilityValue)
        {
        }

        public override ICapabilities ToCapabilities()
        {
            return null;
        }
    }
}

