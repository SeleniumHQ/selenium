// <copyright file="FirefoxDriverTests.cs" company="Selenium Committers">
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

using System.IO;
using OpenQA.Selenium.Firefox;

namespace OpenQA.Selenium.Tests.Firefox;

[TestFixture]
[IgnoreBrowser(Browser.Chrome)]
[IgnoreBrowser(Browser.Edge)]
[IgnoreBrowser(Browser.Safari)]
public class FirefoxDriverTests : DriverTestFixture
{
    [Ignore("")]
    [Test]
    public void ShouldContinueToWorkIfUnableToFindElementById()
    {
        Driver.Url = Urls.FormsPage;

        Assert.That(
            () => Driver.FindElement(By.Id("notThere")),
            Throws.InstanceOf<NoSuchElementException>());

        // Is this works, then we're golden
        Driver.Url = Urls.XhtmlTestPage;
    }

    [Ignore("")]
    [Test]
    public void ShouldWaitUntilBrowserHasClosedProperly()
    {
        Driver.Url = Urls.SimpleTestPage;
        Driver.Close();

        CreateFreshDriver();

        Driver.Url = Urls.FormsPage;
        IWebElement textarea = Driver.FindElement(By.Id("withText"));
        string expectedText = "I like cheese" + System.Environment.NewLine
            + System.Environment.NewLine + "It's really nice";
        textarea.Clear();
        textarea.SendKeys(expectedText);

        string seenText = textarea.GetAttribute("value");
        Assert.That(seenText, Is.EqualTo(expectedText));
    }

    [Ignore("")]
    [Test]
    public void ShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously()
    {
        IWebDriver secondDriver = new FirefoxDriver();

        Driver.Url = Urls.XhtmlTestPage;
        secondDriver.Url = Urls.FormsPage;

        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
        Assert.That(secondDriver.Title, Is.EqualTo("We Leave From Here"));

        // We only need to quit the second driver if the test passes
        secondDriver.Quit();
    }

    [Ignore("")]
    [Test]
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

    [Ignore("")]
    [Test]
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

    [Ignore("")]
    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void FocusRemainsInOriginalWindowWhenOpeningNewWindow()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, make sure the current window still gets
        // native events (keyboard events in this case).
        Driver.Url = Urls.XhtmlTestPage;

        Driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();

        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));
    }

    [Ignore("")]
    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void SwitchingWindowShouldSwitchFocus()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, switch to it, make sure it gets native events.
        // Then switch back to the original window, make sure it gets native events.
        Driver.Url = Urls.XhtmlTestPage;

        string originalWinHandle = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();

        List<string> allWindowHandles = new List<string>(Driver.WindowHandles);

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        allWindowHandles.Remove(originalWinHandle);
        string newWinHandle = (string)allWindowHandles[0];

        // Key events in new window.
        Driver.SwitchTo().Window(newWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");
        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));

        // Key events in original window.
        Driver.SwitchTo().Window(originalWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter2 = Driver.FindElement(By.Id("keyReporter"));
        keyReporter2.SendKeys("QWERTY");
        Assert.That(keyReporter2.GetAttribute("value"), Is.EqualTo("QWERTY"));
    }

    [Ignore("")]
    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ClosingWindowAndSwitchingToOriginalSwitchesFocus()
    {
        if (PlatformHasNativeEvents() == false)
        {
            return;
        }
        // Scenario: Open a new window, switch to it, close it, switch back to the
        // original window - make sure it gets native events.
        Driver.Url = Urls.XhtmlTestPage;
        string originalWinHandle = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Name("windowOne")).Click();

        SleepBecauseWindowsTakeTimeToOpen();
        List<string> allWindowHandles = new List<string>(Driver.WindowHandles);
        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        allWindowHandles.Remove(originalWinHandle);
        string newWinHandle = (string)allWindowHandles[0];
        // Switch to the new window.
        Driver.SwitchTo().Window(newWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();
        // Close new window.
        Driver.Close();

        // Switch back to old window.
        Driver.SwitchTo().Window(originalWinHandle);
        SleepBecauseWindowsTakeTimeToOpen();

        // Send events to the new window.
        Driver.Url = Urls.JavascriptPage;
        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");
        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));
    }

    [Ignore("")]
    [Test]
    public void CanBlockInvalidSslCertificates()
    {
        FirefoxProfile profile = new FirefoxProfile();
        string url = Urls.WhereIsSecure("simpleTest.html");

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

    [Ignore("")]
    [Test]
    public void ShouldAllowUserToSuccessfullyOverrideTheHomePage()
    {
        FirefoxProfile profile = new FirefoxProfile();
        profile.SetPreference("browser.startup.page", "1");
        profile.SetPreference("browser.startup.homepage", Urls.JavascriptPage);

        FirefoxOptions options = new FirefoxOptions();
        options.Profile = profile;

        IWebDriver driver2 = new FirefoxDriver(options);

        try
        {
            Assert.That(driver2.Url, Is.EqualTo(Urls.JavascriptPage));
        }
        finally
        {
            driver2.Quit();
        }
    }

    [Test]
    public void ShouldInstallAndUninstallXpiAddon()
    {
        FirefoxDriver firefoxDriver = Driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example.xpi");
        string id = firefoxDriver.InstallAddOnFromFile(extension);

        Driver.Url = Urls.BlankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        Driver.Navigate().Refresh();
        Assert.That(Driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=2045054")]
    public void ShouldInstallAndUninstallUnSignedZipAddon()
    {
        FirefoxDriver firefoxDriver = Driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example-unsigned.zip");
        string id = firefoxDriver.InstallAddOnFromFile(extension, true);

        Driver.Url = Urls.BlankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        Driver.Navigate().Refresh();
        Assert.That(Driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    public void ShouldInstallAndUninstallSignedZipAddon()
    {
        FirefoxDriver firefoxDriver = Driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example.zip");
        string id = firefoxDriver.InstallAddOnFromFile(extension);

        Driver.Url = Urls.BlankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        Driver.Navigate().Refresh();
        Assert.That(Driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    [IgnorePlatform("windows", "Signed directory add-on install fails on Windows (ERROR_CORRUPT_FILE).")]
    public void ShouldInstallAndUninstallSignedDirAddon()
    {
        FirefoxDriver firefoxDriver = Driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example-signed");
        string id = firefoxDriver.InstallAddOnFromDirectory(extension);

        Driver.Url = Urls.BlankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        Driver.Navigate().Refresh();
        Assert.That(Driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=2045054")]
    public void ShouldInstallAndUninstallUnSignedDirAddon()
    {
        FirefoxDriver firefoxDriver = Driver as FirefoxDriver;

        string extension = GetPath("webextensions-selenium-example");
        string id = firefoxDriver.InstallAddOnFromDirectory(extension, true);

        Driver.Url = Urls.BlankPage;

        IWebElement injected = firefoxDriver.FindElement(By.Id("webextensions-selenium-example"));
        Assert.That(injected.Text, Is.EqualTo("Content injected by webextensions-selenium-example"));

        firefoxDriver.UninstallAddOn(id);

        Driver.Navigate().Refresh();
        Assert.That(Driver.FindElements(By.Id("webextensions-selenium-example")).Count, Is.Zero);
    }

    private string GetPath(string name)
    {
        try
        {
            // For directories, locate a file inside and get parent (runfiles manifest only lists files)
            string path = Bazel.Runfiles.Create().Rlocation($"_main/common/extensions/{name}/manifest.json");
            return Path.GetDirectoryName(path);
        }
        catch (FileNotFoundException)
        {
            string sCurrentDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string sFile = Path.Combine(sCurrentDirectory, "../../../../common/extensions/" + name);
            return Path.GetFullPath(sFile);
        }
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
