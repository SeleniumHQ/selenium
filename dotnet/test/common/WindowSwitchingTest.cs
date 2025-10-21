// <copyright file="WindowSwitchingTest.cs" company="Selenium Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium;

[TestFixture]
public class WindowSwitchingTest : DriverTestFixture
{
    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations()
    {
        driver.Url = xhtmlTestPage;
        String current = driver.CurrentWindowHandle;

        driver.FindElement(By.LinkText("Open new window")).Click();
        Assert.That(driver.Title, Is.EqualTo("XHTML Test Page"));

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(driver.Title, Is.EqualTo("We Arrive Here"));

        driver.Url = iframesPage;
        string handle = driver.CurrentWindowHandle;
        driver.FindElement(By.Id("iframe_page_heading"));
        driver.SwitchTo().Frame("iframe1");
        Assert.That(handle, Is.EqualTo(driver.CurrentWindowHandle));
        driver.SwitchTo().DefaultContent();
        driver.Close();

        driver.SwitchTo().Window(current);
        //Assert.That(driver.Title, Is.EqualTo("TML Test Page"));
    }

    [Test]
    public void ShouldThrowNoSuchWindowException()
    {
        driver.Url = xhtmlTestPage;
        String current = driver.CurrentWindowHandle;

        Assert.That(
            () => driver.SwitchTo().Window("invalid name"),
            Throws.TypeOf<NoSuchWindowException>());

        driver.SwitchTo().Window(current);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle()
    {
        driver.Url = (xhtmlTestPage);
        String current = driver.CurrentWindowHandle;
        int currentWindowHandles = driver.WindowHandles.Count;

        driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        driver.SwitchTo().Window("result");
        driver.Close();

        try
        {
            Assert.That(
                () => driver.CurrentWindowHandle,
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed()
    {
        driver.Url = (xhtmlTestPage);
        String current = driver.CurrentWindowHandle;
        int currentWindowHandles = driver.WindowHandles.Count;

        driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        driver.SwitchTo().Window("result");
        driver.Close();

        try
        {
            Assert.That(
                () => driver.Title,
                Throws.TypeOf<NoSuchWindowException>());

            Assert.That(
                () => driver.FindElement(By.TagName("body")),
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed()
    {
        driver.Url = (xhtmlTestPage);
        String current = driver.CurrentWindowHandle;
        int currentWindowHandles = driver.WindowHandles.Count;

        driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        driver.SwitchTo().Window("result");
        IWebElement body = driver.FindElement(By.TagName("body"));
        driver.Close();

        try
        {
            Assert.That(
                () => body.Text,
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ShouldBeAbleToIterateOverAllOpenWindows()
    {
        driver.Url = xhtmlTestPage;
        driver.FindElement(By.Name("windowOne")).Click();
        WaitFor(WindowCountToBe(2), "Window count was not 2");
        driver.FindElement(By.Name("windowTwo")).Click();
        WaitFor(WindowCountToBe(3), "Window count was not 3");

        ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

        // There should be three windows. We should also see each of the window titles at least once.
        List<string> seenHandles = new List<string>();
        foreach (string handle in allWindowHandles)
        {
            Assert.That(seenHandles, Has.No.Member(handle));
            driver.SwitchTo().Window(handle);
            seenHandles.Add(handle);
        }

        Assert.That(allWindowHandles, Has.Exactly(3).Items);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
    {
        driver.Url = xhtmlTestPage;

        String currentHandle = driver.CurrentWindowHandle;

        driver.FindElement(By.Name("windowThree")).Click();

        driver.SwitchTo().Window("result");

        try
        {
            IWebElement closeElement = WaitFor(() => { return driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
            closeElement.Click();
        }
        finally
        {
            driver.SwitchTo().Window(currentHandle);
            driver.FindElement(By.Id("linkId"));
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void CanCallGetWindowHandlesAfterClosingAWindow()
    {
        bool isIEDriver = TestUtilities.IsInternetExplorer(driver);
        bool isIE6 = TestUtilities.IsIE6(driver);

        driver.Url = xhtmlTestPage;

        String currentHandle = driver.CurrentWindowHandle;

        driver.FindElement(By.Name("windowThree")).Click();

        driver.SwitchTo().Window("result");

        try
        {
            IWebElement closeElement = WaitFor(() => { return driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
            closeElement.Click();
            if (isIEDriver && !isIE6)
            {
                IAlert alert = WaitFor<IAlert>(AlertToBePresent(), "No alert found");
                alert.Accept();
            }
            ReadOnlyCollection<string> handles = driver.WindowHandles;
            // If we make it this far, we're all good.
        }
        finally
        {
            driver.SwitchTo().Window(currentHandle);
        }
    }

    [Test]
    public void CanObtainAWindowHandle()
    {
        driver.Url = xhtmlTestPage;

        String currentHandle = driver.CurrentWindowHandle;

        Assert.That(currentHandle, Is.Not.Null);
    }

    [Test]
    public void FailingToSwitchToAWindowLeavesTheCurrentWindowAsIs()
    {
        driver.Url = xhtmlTestPage;
        String current = driver.CurrentWindowHandle;

        Assert.That(
            () => driver.SwitchTo().Window("i will never exist"),
            Throws.TypeOf<NoSuchWindowException>(),
            "Should not be able to change to a non-existent window");

        String newHandle = driver.CurrentWindowHandle;

        Assert.That(newHandle, Is.EqualTo(current));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void CanCloseWindowWhenMultipleWindowsAreOpen()
    {
        driver.Url = xhtmlTestPage;
        driver.FindElement(By.Name("windowOne")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);
        string handle1 = allWindowHandles[1];
        driver.SwitchTo().Window(handle1);
        driver.Close();

        WaitFor(WindowCountToBe(1), "Window count was not 1");

        allWindowHandles = driver.WindowHandles;
        Assert.That(allWindowHandles, Has.One.Items);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void CanCloseWindowAndSwitchBackToMainWindow()
    {
        driver.Url = xhtmlTestPage;

        ReadOnlyCollection<string> currentWindowHandles = driver.WindowHandles;
        string mainHandle = driver.CurrentWindowHandle;

        driver.FindElement(By.Name("windowOne")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        foreach (string handle in allWindowHandles)
        {
            if (handle != mainHandle)
            {
                driver.SwitchTo().Window(handle);
                driver.Close();
            }
        }

        driver.SwitchTo().Window(mainHandle);

        string newHandle = driver.CurrentWindowHandle;
        Assert.That(newHandle, Is.EqualTo(mainHandle));

        Assert.That(driver.WindowHandles, Has.One.Items);
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ClosingOnlyWindowShouldNotCauseTheBrowserToHang()
    {
        driver.Url = xhtmlTestPage;
        driver.Close();
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/610")]
    public void ShouldFocusOnTheTopMostFrameAfterSwitchingToAWindow()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("window_switching_tests/page_with_frame.html");

        ReadOnlyCollection<string> currentWindowHandles = driver.WindowHandles;
        string mainWindow = driver.CurrentWindowHandle;

        driver.FindElement(By.Id("a-link-that-opens-a-new-window")).Click();
        WaitFor(WindowCountToBe(2), "Window count was not 2");

        driver.SwitchTo().Frame("myframe");

        driver.SwitchTo().Window("newWindow");
        driver.Close();
        driver.SwitchTo().Window(mainWindow);

        driver.FindElement(By.Name("myframe"));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldGetBrowserHandles()
    {
        driver.Url = xhtmlTestPage;
        driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        string handle1, handle2;
        handle1 = driver.CurrentWindowHandle;

        System.Threading.Thread.Sleep(1000);
        driver.SwitchTo().Window("result");
        handle2 = driver.CurrentWindowHandle;

        ReadOnlyCollection<string> handles = driver.WindowHandles;

        // At least the two handles we want should be there.
        Assert.That(handles, Does.Contain(handle1), "Should have contained current handle");
        Assert.That(handles, Does.Contain(handle2), "Should have contained result handle");

        // Some (semi-)clean up..
        driver.SwitchTo().Window(handle2);
        driver.Close();
        driver.SwitchTo().Window(handle1);
        driver.Url = macbethPage;
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CloseShouldCloseCurrentHandleOnly()
    {
        driver.Url = xhtmlTestPage;
        driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        string handle1, handle2;
        handle1 = driver.CurrentWindowHandle;

        driver.SwitchTo().Window("result");
        handle2 = driver.CurrentWindowHandle;

        driver.Close();

        SleepBecauseWindowsTakeTimeToOpen();

        ReadOnlyCollection<string> handles = driver.WindowHandles;

        Assert.That(handles, Has.No.Member(handle2), "Invalid handle still in handle list");
        Assert.That(handles, Contains.Item(handle1), "Valid handle not in handle list");
    }

    [Test]
    public void ShouldBeAbleToCreateANewWindow()
    {
        driver.Url = xhtmlTestPage;
        string originalHandle = driver.CurrentWindowHandle;
        driver.SwitchTo().NewWindow(WindowType.Tab);
        WaitFor(WindowCountToBe(2), "Window count was not 2");
        string newWindowHandle = driver.CurrentWindowHandle;
        driver.Close();
        driver.SwitchTo().Window(originalHandle);
        Assert.That(newWindowHandle, Is.Not.EqualTo(originalHandle));
    }

    private void SleepBecauseWindowsTakeTimeToOpen()
    {
        try
        {
            System.Threading.Thread.Sleep(1000);
        }
        catch (Exception)
        {
            Assert.Fail("Interrupted");
        }
    }

    private Func<bool> WindowCountToBe(int desiredCount)
    {
        return () =>
        {
            return driver.WindowHandles.Count == desiredCount;
        };
    }

    private Func<bool> WindowWithName(string name)
    {
        return () =>
        {
            try
            {
                driver.SwitchTo().Window(name);
                return true;
            }
            catch (NoSuchWindowException)
            {
                return false;
            }
        };
    }

    private Func<IAlert> AlertToBePresent()
    {
        return () =>
        {
            try
            {
                return driver.SwitchTo().Alert();
            }
            catch (NoAlertPresentException)
            {
                return null;
            }
        };
    }
}
