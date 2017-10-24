using NUnit.Framework;
using OpenQA.Selenium.Internal;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class CombinedInputActionsTest : DriverTestFixture
    {
        [SetUp]
        public void Setup()
        {
            new Actions(driver).SendKeys(Keys.Null).Perform();
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [TearDown]
        public void ReleaseModifierKeys()
        {
            new Actions(driver).SendKeys(Keys.Null).Perform();
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE reports [0,0] as location for <option> elements")]
        [IgnoreBrowser(Browser.Remote, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldAllowClickingOnFormElements()
        {
            driver.Url = formSelectionPage;

            ReadOnlyCollection<IWebElement> options = driver.FindElements(By.TagName("option"));

            Actions actionBuider = new Actions(driver);
            IAction selectThreeOptions = actionBuider.Click(options[1])
                .KeyDown(Keys.Shift)
                .Click(options[2])
                .Click(options[3])
                .KeyUp(Keys.Shift).Build();

            selectThreeOptions.Perform();

            IWebElement showButton = driver.FindElement(By.Name("showselected"));
            showButton.Click();

            IWebElement resultElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("roquefort parmigiano cheddar", resultElement.Text, "Should have picked the last three options.");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not respond to combined input using SendMessage, only SendInput")]
        [IgnoreBrowser(Browser.Remote, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldAllowSelectingMultipleItems()
        {
            driver.Url = selectableItemsPage;

            IWebElement reportingElement = driver.FindElement(By.Id("infodiv"));

            Assert.AreEqual("no info", reportingElement.Text);

            ReadOnlyCollection<IWebElement> listItems = driver.FindElements(By.TagName("li"));

            IAction selectThreeItems = new Actions(driver).KeyDown(Keys.Control)
                .Click(listItems[1])
                .Click(listItems[3])
                .Click(listItems[5])
                .KeyUp(Keys.Control).Build();

            selectThreeItems.Perform();

            Assert.AreEqual("#item2 #item4 #item6", reportingElement.Text);

            // Now click on another element, make sure that's the only one selected.
            new Actions(driver).Click(listItems[6]).Build().Perform();
            Assert.AreEqual("#item7", reportingElement.Text);
        }

        private void NavigateToClicksPageAndClickLink()
        {
            driver.Url = clicksPage;

            WaitFor(() => { return driver.FindElement(By.Id("normal")); }, "Could not find element with id 'normal'");
            IWebElement link = driver.FindElement(By.Id("normal"));

            new Actions(driver)
                .Click(link)
                .Perform();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title is not 'XHTML Test Page'");
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void CanClickOnLinks()
        {
            this.NavigateToClicksPageAndClickLink();
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void CanClickOnLinksWithAnOffset()
        {
            driver.Url = clicksPage;

            WaitFor(() => { return driver.FindElement(By.Id("normal")); }, "Could not find element with id 'normal'");
            IWebElement link = driver.FindElement(By.Id("normal"));

            new Actions(driver)
                .MoveToElement(link, 1, 1)
                .Click()
                .Perform();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title is not 'XHTML Test Page'");
        }

        /**
         * This test demonstrates the following problem: When the representation of
         * the mouse in the driver keeps the wrong state, mouse movement will end
         * up at the wrong coordinates.
         */
        [Test]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void MouseMovementWorksWhenNavigatingToAnotherPage()
        {
            NavigateToClicksPageAndClickLink();

            IWebElement linkId = driver.FindElement(By.Id("linkId"));
            new Actions(driver)
                .MoveToElement(linkId, 1, 1)
                .Click()
                .Perform();

            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title is not 'We Arrive Here'");
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Firefox, "Windows native events library does not support storing modifiers state yet.")]
        public void ChordControlCutAndPaste()
        {
            // FIXME: macs don't have CONRTROL key
            //if (getEffectivePlatform().is(Platform.MAC)) {
            //  return;
            //}

            //if (getEffectivePlatform().is(Platform.WINDOWS) &&
            //    (isInternetExplorer(driver) || isFirefox(driver))) {
            //  System.out.println("Skipping testChordControlCutAndPaste on Windows: native events library" +
            //      " does not support storing modifiers state yet.");
            //  return;
            //}

            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            new Actions(driver)
                .SendKeys(element, "abc def")
                .Perform();

            Assert.AreEqual("abc def", element.GetAttribute("value"));

            //TODO: Figure out why calling sendKey(Key.CONTROL + "a") and then
            //sendKeys("x") does not work on Linux.
            new Actions(driver).KeyDown(Keys.Control)
                .SendKeys("a" + "x")
                .Perform();

            // Release keys before next step.
            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual(string.Empty, element.GetAttribute("value"));

            new Actions(driver).KeyDown(Keys.Control)
                .SendKeys("v")
                .SendKeys("v")
                .Perform();

            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual("abc defabc def", element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not respond to combined input using SendMessage, only SendInput")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        public void CombiningShiftAndClickResultsInANewWindow()
        {
            if (!IsNativeEventsEnabled || (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux)))
            {
                //Assert.Ignore("Skipping CombiningShiftAndClickResultsInANewWindow: Only works with native events on Linux.");
            }

            driver.Url = linkedImage;
            IWebElement link = driver.FindElement(By.Id("link"));
            string originalTitle = driver.Title;

            new Actions(driver)
                .MoveToElement(link)
                .KeyDown(Keys.Shift)
                .Click(link)
                .KeyUp(Keys.Shift)
                .Perform();
            WaitFor(() => { return driver.WindowHandles.Count > 1; }, "Did not receive new window");
            Assert.AreEqual(2, driver.WindowHandles.Count, "Should have opened a new window.");
            Assert.AreEqual(originalTitle, driver.Title, "Should not have navigated away.");

            string originalHandle = driver.CurrentWindowHandle;
            foreach(string newHandle in driver.WindowHandles)
            {
                if (newHandle != originalHandle)
                {
                    driver.SwitchTo().Window(newHandle);
                    driver.Close();
                }
            }

            driver.SwitchTo().Window(originalHandle);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not respond to combined input using SendMessage, only SendInput")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        public void HoldingDownShiftKeyWhileClicking()
        {
            if (!IsNativeEventsEnabled || (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux)))
            {
                //Assert.Ignore("Skipping CombiningShiftAndClickResultsInANewWindow: Only works with native events on Linux.");
            }

            driver.Url = clickEventPage;

            IWebElement toClick = driver.FindElement(By.Id("eventish"));

            new Actions(driver).MoveToElement(toClick).KeyDown(Keys.Shift).Click().KeyUp(Keys.Shift).Perform();

            IWebElement shiftInfo = WaitFor(() => { return driver.FindElement(By.Id("shiftKey")); }, "Could not find element with id 'shiftKey'");
            Assert.AreEqual("true", shiftInfo.Text);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void CanClickOnSuckerFishStyleMenu()
        {
            driver.Url = javascriptPage;

            // Move to a different element to make sure the mouse is not over the
            // element with id 'item1' (from a previous test).
            new Actions(driver).MoveToElement(driver.FindElement(By.Id("dynamo"))).Build().Perform();

            IWebElement element = driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IWebElement target = driver.FindElement(By.Id("item1"));
            Assert.AreEqual(string.Empty, target.Text);
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            new Actions(driver).MoveToElement(element).Build().Perform();

            // Intentionally wait to make sure hover persists.
            System.Threading.Thread.Sleep(2000);

            target.Click();

            IWebElement result = driver.FindElement(By.Id("result"));
            WaitFor(() => { return result.Text.Contains("item 1"); }, "Result element does not contain text 'item 1'");
        }

        [Test]
        [Category("Javascript")]
        public void CanClickOnSuckerFishMenuItem()
        {

            driver.Url = javascriptPage;

            // Move to a different element to make sure the mouse is not over the
            // element with id 'item1' (from a previous test).
            new Actions(driver).MoveToElement(driver.FindElement(By.Id("dynamo"))).Build().Perform();

            IWebElement element = driver.FindElement(By.Id("menu1"));

            new Actions(driver).MoveToElement(element).Build().Perform();

            IWebElement target = driver.FindElement(By.Id("item1"));

            Assert.IsTrue(target.Displayed);
            target.Click();

            IWebElement result = driver.FindElement(By.Id("result"));
            WaitFor(() => { return result.Text.Contains("item 1"); }, "Result element does not contain text 'item 1'");
        }
    }
}
