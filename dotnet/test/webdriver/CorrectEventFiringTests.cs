// <copyright file="CorrectEventFiringTests.cs" company="Selenium Committers">
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
using System.Text;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class CorrectEventFiringTests : DriverTestFixture
{
    [Test]
    public void ShouldFireFocusEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("focus", Driver);
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    [IgnoreBrowser(Browser.Safari, "Safari driver does not support multiple instances")]
    public void ShouldFireFocusEventInNonTopmostWindow()
    {
        IWebDriver driver2 = EnvironmentManager.Instance.CreateDriverInstance();
        try
        {
            // topmost
            driver2.Url = Urls.JavascriptPage;
            ClickOnElementWhichRecordsEvents(driver2);
            AssertEventFired("focus", driver2);

            // non-topmost
            Driver.Url = Urls.JavascriptPage;
            ClickOnElementWhichRecordsEvents(Driver);
            AssertEventFired("focus", Driver);

        }
        finally
        {
            driver2.Quit();
        }
    }

    [Test]
    public void ShouldFireClickEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("click", Driver);
    }

    [Test]
    public void ShouldFireMouseDownEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("mousedown", Driver);
    }

    [Test]
    public void ShouldFireMouseUpEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("mouseup", Driver);
    }

    [Test]
    public void ShouldFireMouseOverEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("mouseover", Driver);
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not report mouse move event when clicking")]
    public void ShouldFireMouseMoveEventWhenClicking()
    {
        Driver.Url = Urls.JavascriptPage;

        // This bears some explanation. In certain cases, if the prior test
        // leaves the mouse cursor immediately over the wrong element, then
        // the mousemove event may not get fired, because the mouse does not
        // actually move. Prevent this situation by forcing the mouse to move
        // to the origin.
        new Actions(Driver).MoveToElement(Driver.FindElement(By.TagName("body"))).Perform();

        ClickOnElementWhichRecordsEvents(Driver);

        AssertEventFired("mousemove", Driver);
    }

    [Test]
    public void ShouldNotThrowIfEventHandlerThrows()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("throwing-mouseover")).Click();
    }

    [Test]
    public void ShouldFireEventsInTheRightOrder()
    {
        Driver.Url = Urls.JavascriptPage;

        ClickOnElementWhichRecordsEvents(Driver);

        string text = Driver.FindElement(By.Id("result")).Text;

        int lastIndex = -1;
        List<string> eventList = new List<string>() { "mousedown", "focus", "mouseup", "click" };
        foreach (string eventName in eventList)
        {
            int index = text.IndexOf(eventName);

            Assert.That(text, Does.Contain(eventName), eventName + " did not fire at all. Text is " + text);
            Assert.That(index, Is.GreaterThan(lastIndex), eventName + " did not fire in the correct order. Text is " + text);
            lastIndex = index;
        }
    }

    [Test]
    public void ShouldIssueMouseDownEvents()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("mousedown")).Click();

        String result = Driver.FindElement(By.Id("result")).Text;
        Assert.That(result, Is.EqualTo("mouse down"));
    }

    [Test]
    public void ShouldIssueClickEvents()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("mouseclick")).Click();

        String result = Driver.FindElement(By.Id("result")).Text;
        Assert.That(result, Is.EqualTo("mouse click"));
    }

    [Test]
    public void ShouldIssueMouseUpEvents()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("mouseup")).Click();

        String result = Driver.FindElement(By.Id("result")).Text;
        Assert.That(result, Is.EqualTo("mouse up"));
    }

    [Test]
    public void MouseEventsShouldBubbleUpToContainingElements()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("child")).Click();

        String result = Driver.FindElement(By.Id("result")).Text;
        Assert.That(result, Is.EqualTo("mouse down"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox)]
    public void ShouldEmitOnChangeEventsWhenSelectingElements()
    {
        Driver.Url = Urls.JavascriptPage;
        //Intentionally not looking up the select tag.  See selenium r7937 for details.
        ReadOnlyCollection<IWebElement> allOptions = Driver.FindElements(By.XPath("//select[@id='selector']//option"));

        String initialTextValue = Driver.FindElement(By.Id("result")).Text;

        IWebElement foo = allOptions[0];
        IWebElement bar = allOptions[1];

        foo.Click();
        Assert.That(Driver.FindElement(By.Id("result")).Text, Is.EqualTo(initialTextValue));
        bar.Click();
        Assert.That(Driver.FindElement(By.Id("result")).Text, Is.EqualTo("bar"));
    }

    [Test]
    public void ShouldEmitOnClickEventsWhenSelectingElements()
    {
        Driver.Url = Urls.JavascriptPage;
        // Intentionally not looking up the select tag. See selenium r7937 for details.
        ReadOnlyCollection<IWebElement> allOptions = Driver.FindElements(By.XPath("//select[@id='selector2']//option"));

        IWebElement foo = allOptions[0];
        IWebElement bar = allOptions[1];

        foo.Click();
        Assert.That(Driver.FindElement(By.Id("result")).Text, Is.EqualTo("foo"));
        bar.Click();
        Assert.That(Driver.FindElement(By.Id("result")).Text, Is.EqualTo("bar"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not fire change event when clicking on checkbox")]
    public void ShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement checkbox = Driver.FindElement(By.Id("checkbox"));

        checkbox.Click();
        Assert.That(Driver.FindElement(By.Id("result")).Text, Is.EqualTo("checkbox thing"));
    }

    [Test]
    public void ShouldEmitClickEventWhenClickingOnATextInputElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement clicker = Driver.FindElement(By.Id("clickField"));
        clicker.Click();

        Assert.That(clicker.GetAttribute("value"), Is.EqualTo("Clicked"));
    }

    [Test]
    public void ShouldFireTwoClickEventsWhenClickingOnALabel()
    {
        Driver.Url = Urls.JavascriptPage;

        Driver.FindElement(By.Id("labelForCheckbox")).Click();

        IWebElement result = Driver.FindElement(By.Id("result"));
        Assert.That(() => WaitFor(() => { return result.Text.Contains("labelclick chboxclick"); }, "Did not find text: " + result.Text), Throws.Nothing);
    }

    [Test]
    public void ClearingAnElementShouldCauseTheOnChangeHandlerToFire()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("clearMe"));
        element.Clear();

        IWebElement result = Driver.FindElement(By.Id("result"));
        Assert.That(result.Text.Trim(), Is.EqualTo("Cleared"));
    }

    [Test]
    public void SendingKeysToAnotherElementShouldCauseTheBlurEventToFire()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("theworks"));
        element.SendKeys("foo");
        IWebElement element2 = Driver.FindElement(By.Id("changeable"));
        element2.SendKeys("bar");
        AssertEventFired("blur", Driver);
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "Safari driver does not support multiple instances")]
    public void SendingKeysToAnotherElementShouldCauseTheBlurEventToFireInNonTopmostWindow()
    {
        IWebDriver driver2 = EnvironmentManager.Instance.CreateDriverInstance();
        IWebElement element;
        IWebElement element2;
        try
        {
            // topmost
            driver2.Url = Urls.JavascriptPage;
            element = driver2.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            element2 = driver2.FindElement(By.Id("changeable"));
            element2.SendKeys("bar");
            AssertEventFired("blur", driver2);

            // non-topmost
            Driver.Url = Urls.JavascriptPage;
            element = Driver.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            element2 = Driver.FindElement(By.Id("changeable"));
            element2.SendKeys("bar");
            AssertEventFired("blur", Driver);
        }
        finally
        {
            driver2.Quit();
        }

        Driver.Url = Urls.JavascriptPage;
        element = Driver.FindElement(By.Id("theworks"));
        element.SendKeys("foo");
        element2 = Driver.FindElement(By.Id("changeable"));
        element2.SendKeys("bar");
        AssertEventFired("blur", Driver);
    }

    [Test]
    public void SendingKeysToAnElementShouldCauseTheFocusEventToFire()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("theworks"));
        element.SendKeys("foo");
        AssertEventFired("focus", Driver);
    }

    [Test]
    public void SendingKeysToAFocusedElementShouldNotBlurThatElement()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("theworks"));
        element.Click();

        //Wait until focused
        bool focused = false;
        IWebElement result = Driver.FindElement(By.Id("result"));
        for (int i = 0; i < 5; ++i)
        {
            string fired = result.Text;
            if (fired.Contains("focus"))
            {
                focused = true;
                break;
            }

            System.Threading.Thread.Sleep(200);
        }

        Assert.That(focused, Is.True, "Clicking on element didn't focus it in time - can't proceed so failing");

        element.SendKeys("a");
        AssertEventNotFired("blur");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Clicking on child does blur parent, whether focused or not.")]
    public void ClickingAnUnfocusableChildShouldNotBlurTheParent()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        // Click on parent, giving it the focus.
        IWebElement parent = Driver.FindElement(By.Id("hideOnBlur"));
        parent.Click();
        AssertEventNotFired("blur");
        // Click on child. It is not focusable, so focus should stay on the parent.
        Driver.FindElement(By.Id("hideOnBlurChild")).Click();
        System.Threading.Thread.Sleep(2000);
        Assert.That(parent.Displayed, Is.True, "#hideOnBlur should still be displayed after click");
        AssertEventNotFired("blur");
        // Click elsewhere, and let the element disappear.
        Driver.FindElement(By.Id("result")).Click();
        AssertEventFired("blur", Driver);
    }

    [Test]
    public void SubmittingFormFromFormElementShouldFireOnSubmitForThatForm()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement formElement = Driver.FindElement(By.Id("submitListeningForm"));
        formElement.Submit();
        AssertEventFired("form-onsubmit", Driver);
    }

    [Test]
    public void SubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement submit = Driver.FindElement(By.Id("submitListeningForm-submit"));
        submit.Submit();
        AssertEventFired("form-onsubmit", Driver);
    }

    [Test]
    public void SubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement submit = Driver.FindElement(By.Id("submitListeningForm-submit"));
        submit.Submit();
        AssertEventFired("form-onsubmit", Driver);
        AssertEventNotFired("text-onclick");
    }

    [Test]
    public void UploadingFileShouldFireOnChangeEvent()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement uploadElement = Driver.FindElement(By.Id("upload"));
        IWebElement result = Driver.FindElement(By.Id("fileResults"));
        Assert.That(result.Text, Is.Empty);

        string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "test.txt");
        System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
        System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
        inputFileWriter.WriteLine("Hello world");
        inputFileWriter.Close();

        uploadElement.SendKeys(inputFile.FullName);
        // Shift focus to something else because send key doesn't make the focus leave
        Driver.FindElement(By.Id("id-name1")).Click();

        inputFile.Delete();
        Assert.That(result.Text, Is.EqualTo("changed"));
    }

    [Test]
    public void ShouldReportTheXAndYCoordinatesWhenClicking()
    {
        Driver.Url = Urls.ClickEventPage;

        IWebElement element = Driver.FindElement(By.Id("eventish"));
        element.Click();

        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(2);
        string clientX = Driver.FindElement(By.Id("clientX")).Text;
        string clientY = Driver.FindElement(By.Id("clientY")).Text;
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(0);

        Assert.That(clientX, Is.Not.EqualTo("0"));
        Assert.That(clientY, Is.Not.EqualTo("0"));
    }

    [Test]
    public void ClickEventsShouldBubble()
    {
        Driver.Url = Urls.ClicksPage;
        Driver.FindElement(By.Id("bubblesFrom")).Click();
        bool eventBubbled = (bool)((IJavaScriptExecutor)Driver).ExecuteScript("return !!window.bubbledClick;");
        Assert.That(eventBubbled, Is.True, "Event didn't bubble up");
    }

    [Test]
    public void ClickOverlappingElements()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            Assert.Ignore("Not supported on IE < 9");
        }

        Driver.Url = Urls.WhereIs("click_tests/overlapping_elements.html");
        Assert.That(() => Driver.FindElement(By.Id("under")).Click(), Throws.InstanceOf<ElementClickInterceptedException>().Or.InstanceOf<WebDriverException>().With.Message.Contains("Other element would receive the click"));
    }

    [Test]
    public void ClickAnElementThatDisappear()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            Assert.Ignore("Not supported on IE < 9");
        }

        StringBuilder expectedLogBuilder = new StringBuilder();
        expectedLogBuilder.AppendLine("Log:");
        expectedLogBuilder.AppendLine("mousedown in over (handled by over)");
        expectedLogBuilder.AppendLine("mousedown in over (handled by body)");
        expectedLogBuilder.AppendLine("mouseup in under (handled by under)");
        expectedLogBuilder.Append("mouseup in under (handled by body)");

        Driver.Url = Urls.WhereIs("click_tests/disappearing_element.html");
        Driver.FindElement(By.Id("over")).Click();
        Assert.That(Driver.FindElement(By.Id("log")).Text, Does.StartWith(expectedLogBuilder.ToString()));
    }

    private void AssertEventNotFired(string eventName)
    {
        IWebElement result = Driver.FindElement(By.Id("result"));
        string text = result.Text;
        Assert.That(text, Does.Not.Contain(eventName));
    }

    private void ClickOnElementWhichRecordsEvents(IWebDriver focusedDriver)
    {
        focusedDriver.FindElement(By.Id("plainButton")).Click();
    }

    private void AssertEventFired(string eventName, IWebDriver focusedDriver)
    {
        IWebElement result = focusedDriver.FindElement(By.Id("result"));
        string text = result.Text;
        Assert.That(text, Does.Contain(eventName));
    }
}
