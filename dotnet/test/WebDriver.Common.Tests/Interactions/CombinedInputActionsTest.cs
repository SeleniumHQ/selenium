using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class CombinedInputActionsTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Chrome, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Remote, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldAllowClickingOnFormElements()
        {
            if (!IsNativeEventsEnabled || (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux)))
            {
                Console.WriteLine("Skipping ShouldAllowClickingOnFormElements: Only works with native events on Linux.");
                return;
            }

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
        [IgnoreBrowser(Browser.Chrome, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Remote, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldAllowSelectingMultipleItems()
        {
            if (!IsNativeEventsEnabled || (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux)))
            {
                Console.WriteLine("Skipping ShouldAllowSelectingMultipleItems: Only works with native events on Linux.");
                return;
            }

            driver.Url = selectableItemsPage;

            IWebElement reportingElement = driver.FindElement(By.Id("infodiv"));

            Assert.AreEqual("no info", reportingElement.Text);

            ReadOnlyCollection<IWebElement> listItems = driver.FindElements(By.TagName("li"));

            Actions actionBuider = new Actions(driver);
            IAction selectThreeItems = actionBuider.KeyDown(Keys.Control)
                .Click(listItems[1])
                .Click(listItems[3])
                .Click(listItems[5])
                .KeyUp(Keys.Control).Build();

            selectThreeItems.Perform();

            Assert.AreEqual("#item2 #item4 #item6", reportingElement.Text);

            // Now click on another element, make sure that's the only one selected.
            actionBuider.Click(listItems[6]).Build().Perform();
            Assert.AreEqual("#item7", reportingElement.Text);
        }

        private void NavigateToClicksPageAndClickLink()
        {
            driver.Url = clicksPage;

            WaitFor(() => { return driver.FindElement(By.Id("normal")); });
            IWebElement link = driver.FindElement(By.Id("normal"));

            new Actions(driver)
                .Click(link)
                .Perform();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
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
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void CanClickOnLinksWithAnOffset()
        {
            driver.Url = clicksPage;

            WaitFor(() => { return driver.FindElement(By.Id("normal")); });
            IWebElement link = driver.FindElement(By.Id("normal"));

            new Actions(driver)
                .MoveToElement(link, 1, 1)
                .Click()
                .Perform();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; });
        }

        /**
         * This test demonstrates the following problem: When the representation of
         * the mouse in the driver keeps the wrong state, mouse movement will end
         * up at the wrong coordinates.
         */
        [Test]
        [IgnoreBrowser(Browser.Chrome)]
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

            WaitFor(() => { return driver.Title == "We Arrive Here"; });
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.IE, "Windows native events library does not support storing modifiers state yet.")]
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
            new Actions(driver)
                .SendKeys(Keys.Control + "a" + "x")
                .Perform();

            // Release keys before next step.
            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual(string.Empty, element.GetAttribute("value"));

            new Actions(driver)
                .SendKeys(Keys.Control + "v")
                .SendKeys("v")
                .Perform();

            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual("abc defabc def", element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
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
                Console.WriteLine("Skipping CombiningShiftAndClickResultsInANewWindow: Only works with native events on Linux.");
                return;
            }

            driver.Url = linkedImage;
            IWebElement link = driver.FindElement(By.Id("link"));
            string originalTitle = driver.Title;

            int nWindows = driver.WindowHandles.Count;
            new Actions(driver)
                .MoveToElement(link)
                .KeyDown(Keys.Shift)
                .Click()
                .KeyUp(Keys.Shift)
                .Perform();

            Assert.AreEqual(nWindows + 1, driver.WindowHandles.Count, "Should have opened a new window.");
            Assert.AreEqual(originalTitle, driver.Title, "Should not have navigated away.");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
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
                Console.WriteLine("Skipping CombiningShiftAndClickResultsInANewWindow: Only works with native events on Linux.");
                return;
            }

            driver.Url = clickEventPage;

            IWebElement toClick = driver.FindElement(By.Id("eventish"));

            new Actions(driver).KeyDown(Keys.Shift).Click(toClick).KeyUp(Keys.Shift).Perform();

            IWebElement shiftInfo = WaitFor(() => { return driver.FindElement(By.Id("shiftKey")); });
            Assert.AreEqual("true", shiftInfo.Text);
        }
    }
}
