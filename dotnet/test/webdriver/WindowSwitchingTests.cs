// <copyright file="WindowSwitchingTests.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class WindowSwitchingTests : DriverTestFixture
{
    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String current = Driver.CurrentWindowHandle;

        Driver.FindElement(By.LinkText("Open new window")).Click();
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));

        Driver.Url = Urls.IframesPage;
        string handle = Driver.CurrentWindowHandle;
        Driver.FindElement(By.Id("iframe_page_heading"));
        Driver.SwitchTo().Frame("iframe1");
        Assert.That(handle, Is.EqualTo(Driver.CurrentWindowHandle));
        Driver.SwitchTo().DefaultContent();
        Driver.Close();

        Driver.SwitchTo().Window(current);
        //Assert.That(driver.Title, Is.EqualTo("TML Test Page"));
    }

    [Test]
    public void ShouldThrowNoSuchWindowException()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String current = Driver.CurrentWindowHandle;

        Assert.That(
            () => Driver.SwitchTo().Window("invalid name"),
            Throws.TypeOf<NoSuchWindowException>());

        Driver.SwitchTo().Window(current);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle()
    {
        Driver.Url = (Urls.XhtmlTestPage);
        String current = Driver.CurrentWindowHandle;
        int currentWindowHandles = Driver.WindowHandles.Count;

        Driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(Driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        Driver.SwitchTo().Window("result");
        Driver.Close();

        try
        {
            Assert.That(
                () => Driver.CurrentWindowHandle,
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            Driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed()
    {
        Driver.Url = (Urls.XhtmlTestPage);
        String current = Driver.CurrentWindowHandle;
        int currentWindowHandles = Driver.WindowHandles.Count;

        Driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(Driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        Driver.SwitchTo().Window("result");
        Driver.Close();

        try
        {
            Assert.That(
                () => Driver.Title,
                Throws.TypeOf<NoSuchWindowException>());

            Assert.That(
                () => Driver.FindElement(By.TagName("body")),
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            Driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed()
    {
        Driver.Url = (Urls.XhtmlTestPage);
        String current = Driver.CurrentWindowHandle;
        int currentWindowHandles = Driver.WindowHandles.Count;

        Driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Assert.That(Driver.WindowHandles, Has.Exactly(2).Items);

        WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
        Driver.SwitchTo().Window("result");
        IWebElement body = Driver.FindElement(By.TagName("body"));
        Driver.Close();

        try
        {
            Assert.That(
                () => body.Text,
                Throws.TypeOf<NoSuchWindowException>());
        }
        finally
        {
            Driver.SwitchTo().Window(current);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ShouldBeAbleToIterateOverAllOpenWindows()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.Name("windowOne")).Click();
        WaitFor(WindowCountToBe(2), "Window count was not 2");
        Driver.FindElement(By.Name("windowTwo")).Click();
        WaitFor(WindowCountToBe(3), "Window count was not 3");

        ReadOnlyCollection<string> allWindowHandles = Driver.WindowHandles;

        // There should be three windows. We should also see each of the window titles at least once.
        List<string> seenHandles = new List<string>();
        foreach (string handle in allWindowHandles)
        {
            Assert.That(seenHandles, Has.No.Member(handle));
            Driver.SwitchTo().Window(handle);
            seenHandles.Add(handle);
        }

        Assert.That(allWindowHandles, Has.Exactly(3).Items);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
    {
        Driver.Url = Urls.XhtmlTestPage;

        String currentHandle = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Name("windowThree")).Click();

        Driver.SwitchTo().Window("result");

        try
        {
            IWebElement closeElement = WaitFor(() => { return Driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
            closeElement.Click();
        }
        finally
        {
            Driver.SwitchTo().Window(currentHandle);
            Driver.FindElement(By.Id("linkId"));
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void CanCallGetWindowHandlesAfterClosingAWindow()
    {
        bool isIEDriver = TestUtilities.IsInternetExplorer(Driver);
        bool isIE6 = TestUtilities.IsIE6(Driver);

        Driver.Url = Urls.XhtmlTestPage;

        String currentHandle = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Name("windowThree")).Click();

        Driver.SwitchTo().Window("result");

        try
        {
            IWebElement closeElement = WaitFor(() => { return Driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
            closeElement.Click();
            if (isIEDriver && !isIE6)
            {
                IAlert alert = WaitFor<IAlert>(AlertToBePresent(), "No alert found");
                alert.Accept();
            }
            ReadOnlyCollection<string> handles = Driver.WindowHandles;
            // If we make it this far, we're all good.
        }
        finally
        {
            Driver.SwitchTo().Window(currentHandle);
        }
    }

    [Test]
    public void CanObtainAWindowHandle()
    {
        Driver.Url = Urls.XhtmlTestPage;

        String currentHandle = Driver.CurrentWindowHandle;

        Assert.That(currentHandle, Is.Not.Null);
    }

    [Test]
    public void FailingToSwitchToAWindowLeavesTheCurrentWindowAsIs()
    {
        Driver.Url = Urls.XhtmlTestPage;
        String current = Driver.CurrentWindowHandle;

        Assert.That(
            () => Driver.SwitchTo().Window("i will never exist"),
            Throws.TypeOf<NoSuchWindowException>(),
            "Should not be able to change to a non-existent window");

        String newHandle = Driver.CurrentWindowHandle;

        Assert.That(newHandle, Is.EqualTo(current));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void CanCloseWindowWhenMultipleWindowsAreOpen()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.Name("windowOne")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        ReadOnlyCollection<string> allWindowHandles = Driver.WindowHandles;

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);
        string handle1 = allWindowHandles[1];
        Driver.SwitchTo().Window(handle1);
        Driver.Close();

        WaitFor(WindowCountToBe(1), "Window count was not 1");

        allWindowHandles = Driver.WindowHandles;
        Assert.That(allWindowHandles, Has.One.Items);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void CanCloseWindowAndSwitchBackToMainWindow()
    {
        Driver.Url = Urls.XhtmlTestPage;

        ReadOnlyCollection<string> currentWindowHandles = Driver.WindowHandles;
        string mainHandle = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Name("windowOne")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        ReadOnlyCollection<string> allWindowHandles = Driver.WindowHandles;

        // There should be two windows. We should also see each of the window titles at least once.
        Assert.That(allWindowHandles, Has.Exactly(2).Items);

        foreach (string handle in allWindowHandles)
        {
            if (handle != mainHandle)
            {
                Driver.SwitchTo().Window(handle);
                Driver.Close();
            }
        }

        Driver.SwitchTo().Window(mainHandle);

        string newHandle = Driver.CurrentWindowHandle;
        Assert.That(newHandle, Is.EqualTo(mainHandle));

        Assert.That(Driver.WindowHandles, Has.One.Items);
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    public void ClosingOnlyWindowShouldNotCauseTheBrowserToHang()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.Close();
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/610")]
    public void ShouldFocusOnTheTopMostFrameAfterSwitchingToAWindow()
    {
        Driver.Url = Urls.WhereIs("window_switching_tests/page_with_frame.html");

        ReadOnlyCollection<string> currentWindowHandles = Driver.WindowHandles;
        string mainWindow = Driver.CurrentWindowHandle;

        Driver.FindElement(By.Id("a-link-that-opens-a-new-window")).Click();
        WaitFor(WindowCountToBe(2), "Window count was not 2");

        Driver.SwitchTo().Frame("myframe");

        Driver.SwitchTo().Window("newWindow");
        Driver.Close();
        Driver.SwitchTo().Window(mainWindow);

        Driver.FindElement(By.Name("myframe"));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldGetBrowserHandles()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        string handle1, handle2;
        handle1 = Driver.CurrentWindowHandle;

        System.Threading.Thread.Sleep(1000);
        Driver.SwitchTo().Window("result");
        handle2 = Driver.CurrentWindowHandle;

        ReadOnlyCollection<string> handles = Driver.WindowHandles;

        // At least the two handles we want should be there.
        Assert.That(handles, Does.Contain(handle1), "Should have contained current handle");
        Assert.That(handles, Does.Contain(handle2), "Should have contained result handle");

        // Some (semi-)clean up..
        Driver.SwitchTo().Window(handle2);
        Driver.Close();
        Driver.SwitchTo().Window(handle1);
        Driver.Url = Urls.MacbethPage;
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CloseShouldCloseCurrentHandleOnly()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.LinkText("Open new window")).Click();

        WaitFor(WindowCountToBe(2), "Window count was not 2");

        string handle1, handle2;
        handle1 = Driver.CurrentWindowHandle;

        Driver.SwitchTo().Window("result");
        handle2 = Driver.CurrentWindowHandle;

        Driver.Close();

        SleepBecauseWindowsTakeTimeToOpen();

        ReadOnlyCollection<string> handles = Driver.WindowHandles;

        Assert.That(handles, Has.No.Member(handle2), "Invalid handle still in handle list");
        Assert.That(handles, Contains.Item(handle1), "Valid handle not in handle list");
    }

    [Test]
    public void ShouldBeAbleToCreateANewWindow()
    {
        Driver.Url = Urls.XhtmlTestPage;
        string originalHandle = Driver.CurrentWindowHandle;
        Driver.SwitchTo().NewWindow(WindowType.Tab);
        WaitFor(WindowCountToBe(2), "Window count was not 2");
        string newWindowHandle = Driver.CurrentWindowHandle;
        Driver.Close();
        Driver.SwitchTo().Window(originalHandle);
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
            return Driver.WindowHandles.Count == desiredCount;
        };
    }

    private Func<bool> WindowWithName(string name)
    {
        return () =>
        {
            try
            {
                Driver.SwitchTo().Window(name);
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
                return Driver.SwitchTo().Alert();
            }
            catch (NoAlertPresentException)
            {
                return null;
            }
        };
    }
}
