// <copyright file="FirefoxDriverTest.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.IO;
using System.Threading;

namespace OpenQA.Selenium.Firefox;

[TestFixture]
public class FirefoxDriverTest : DriverTestFixture
{
    //[Test]
    public void ShouldContinueToWorkIfUnableToFindElementById()
    {
        driver.Url = formsPage;

        Assert.That(
            () => driver.FindElement(By.Id("notThere")),
            Throws.InstanceOf<NoSuchElementException>());

        // Is this works, then we're golden
        driver.Url = xhtmlTestPage;
    }

    //[Test]
    public void ShouldWaitUntilBrowserHasClosedProperly()
    {
        driver.Url = simpleTestPage;
        driver.Close();

        CreateFreshDriver();

        driver.Url = formsPage;
        IWebElement textarea = driver.FindElement(By.Id("withText"));
        string expectedText = "I like cheese" + System.Environment.NewLine
            + System.Environment.NewLine + "It's really nice";
        textarea.Clear();
        textarea.SendKeys(expectedText);

        string seenText = textarea.GetAttribute("value");
        Assert.That(seenText, Is.EqualTo(expectedText));
    }

    //[Test]
    public void ShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously()
    {
        IWebDriver secondDriver = new FirefoxDriver();

        driver.Url = xhtmlTestPage;
        secondDriver.Url = formsPage;

        Assert.That(driver.Title, Is.EqualTo("XHTML Test Page"));
        Assert.That(secondDriver.Title, Is.EqualTo("We Leave From Here"));

        // We only need to quit the second driver if the test passes
        secondDriver.Quit();
    }

    //[Test]
    public void ShouldBeAbleToStartANamedProfile()
    {
        FirefoxProfile profile = new FirefoxProfileManager().GetProfile("default");
        if (profile != null)
        {
            FirefoxOptions options = new FirefoxOptions();
            options.Profile = profile;
            IWebDriver firefox = new FirefoxDriver(options);
            firefox.Quit();
        }
        else
        {
            Assert.Ignore("Skipping test: No profile named \"default\" found.");
        }
    }

    //[Test]
    public void ShouldRemoveProfileAfterExit()
    {
        FirefoxProfile profile = new FirefoxProfile();
        FirefoxOptions options = new FirefoxOptions();
        options.Profile = profile;
        IWebDriver firefox = new FirefoxDriver(options);
        string profileLocation = profile.ProfileDirectory;

        firefox.Quit();
        Assert.That(profileLocation, Does.Not.Exist);
    }

    //[Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void FocusRemainsInOriginalWindowWhenOpeningNewWindow()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, make sure the current window still gets
        // native events (keyboard events in this case).
        driver.Url = xhtmlTestPage;

        driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();

        driver.Url = javascriptPage;

        IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));
    }

    //[Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void SwitchingWindowShouldSwitchFocus()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, switch to it, make sure it gets native events.
        // Then switch back to the original window, make sure it gets native events.
        driver.Url = xhtmlTestPage;

        string originalWinHandle = driver.CurrentWindowHandle;

        driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();

        List<string> allWindowHandles = new List<string>(driver.WindowHandles);

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        allWindowHandles.Remove(originalWinHandle);
        string newWinHandle = (string)allWindowHandles[0];

        // Key events in new window.
        driver.SwitchTo().Window(newWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        driver.Url = javascriptPage;

        IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");
        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));

        // Key events in original window.
        driver.SwitchTo().Window(originalWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        driver.Url = javascriptPage;

        IWebElement keyReporter2 = driver.FindElement(By.Id("keyReporter"));
        keyReporter2.SendKeys("QWERTY");
        Assert.That(keyReporter2.GetAttribute("value"), Is.EqualTo("QWERTY"));
    }

    //[Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ClosingWindowAndSwitchingToOriginalSwitchesFocus()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, switch to it, close it, switch back to the
        // original window - make sure it gets native events.
        driver.Url = xhtmlTestPage;
        string originalWinHandle = driver.CurrentWindowHandle;

        driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();
        List<string> allWindowHandles = new List<string>(driver.WindowHandles);
        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        allWindowHandles.Remove(originalWinHandle);
        string newWinHandle = (string)allWindowHandles[0];
        // Switch to the new window.
        driver.SwitchTo().Window(newWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        // Close new window.
        driver.Close();

        // Switch back to old window.
        driver.SwitchTo().Window(originalWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();

        // Send events to the new window.
        driver.Url = javascriptPage;
        IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");
        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));
    }

    //[Test]
    public void CanBlockInvalidSslCertificates()
    {
        FirefoxProfile profile = new FirefoxProfile();
        string url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");

        IWebDriver secondDriver = null;
        try
        {
            FirefoxOptions options = new FirefoxOptions();
            options.Profile = profile;
            secondDriver = new FirefoxDriver(options);
            secondDriver.Url = url;
            string gotTitle = secondDriver.Title;
            Assert.That(gotTitle, Is.EqualTo("Hello IWebDriver"));
        }
        catch (Exception)
        {
            Assert.Fail("Creating driver with untrusted certificates set to false failed.");
        }
        finally
        {
            if (secondDriver != null)
            {
                secondDriver.Quit();
            }
        }
    }

    //[Test]
    public void ShouldAllowUserToSuccessfullyOverrideTheHomePage()
    {
        FirefoxProfile profile = new FirefoxProfile();
        profile.SetPreference("browser.startup.page", "1");
        profile.SetPreference("browser.startup.homepage", javascriptPage);

        FirefoxOptions options = new FirefoxOptions();
        options.Profile = profile;

        IWebDriver driver2 = new FirefoxDriver(options);

        try
        {
            Assert.That(driver2.Url, Is.EqualTo(javascriptPage));
        }
        finally
        {
            driver2.Quit();
        }
    }

    [Test]
    public void ShouldInstallAndUninstallXpiAddon()
    {
        FirefoxDriver firefoxDriver = driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example.xpi");
        string id = firefoxDriver.InstallAddOnFromFile(extension);

        driver.Url = blankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        driver.Navigate().Refresh();
        Assert.That(driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    public void ShouldInstallAndUninstallUnSignedZipAddon()
    {
        FirefoxDriver firefoxDriver = driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example-unsigned.zip");
        string id = firefoxDriver.InstallAddOnFromFile(extension, true);

        driver.Url = blankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        driver.Navigate().Refresh();
        Assert.That(driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    public void ShouldInstallAndUninstallSignedZipAddon()
    {
        FirefoxDriver firefoxDriver = driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example.zip");
        string id = firefoxDriver.InstallAddOnFromFile(extension);

        driver.Url = blankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        driver.Navigate().Refresh();
        Assert.That(driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    public void ShouldInstallAndUninstallSignedDirAddon()
    {
        FirefoxDriver firefoxDriver = driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example-signed");
        string id = firefoxDriver.InstallAddOnFromDirectory(extension);

        driver.Url = blankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        driver.Navigate().Refresh();
        Assert.That(driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    public void ShouldInstallAndUninstallUnSignedDirAddon()
    {
        FirefoxDriver firefoxDriver = driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example");
        string id = firefoxDriver.InstallAddOnFromDirectory(extension, true);

        driver.Url = blankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        driver.Navigate().Refresh();
        Assert.That(driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    private string GetPath(string name)
    {
        string sCurrentDirectory = AppDomain.CurrentDomain.BaseDirectory;
        string sFile = Path.Combine(sCurrentDirectory, "../../../../common/extensions/" + name);
        return Path.GetFullPath(sFile);
    }

    private static bool PlatformHasNativeEvents()
    {
        return true;
    }

    private void SleepBecauseWindowsTakeTimeToOpen()
    {
        try
        {
            Thread.Sleep(1000);
        }
        catch (ThreadInterruptedException)
        {
            Assert.Fail("Interrupted");
        }
    }
}
