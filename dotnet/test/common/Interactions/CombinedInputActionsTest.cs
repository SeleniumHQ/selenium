using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Internal;
using System;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Runtime.InteropServices;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class CombinedInputActionsTest : DriverTestFixture
    {
        [SetUp]
        public void Setup()
        {
            // new Actions(driver).SendKeys(Keys.Null).Perform();
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [TearDown]
        public void ReleaseModifierKeys()
        {
            // new Actions(driver).SendKeys(Keys.Null).Perform();
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE reports [0,0] as location for <option> elements")]
        public void PlainClickingOnMultiSelectionList()
        {
            driver.Url = formSelectionPage;

            ReadOnlyCollection<IWebElement> options = driver.FindElements(By.TagName("option"));

            Actions actionBuider = new Actions(driver);
            IAction selectThreeOptions = actionBuider.Click(options[1])
                .Click(options[2])
                .Click(options[3]).Build();

            selectThreeOptions.Perform();

            IWebElement showButton = driver.FindElement(By.Name("showselected"));
            showButton.Click();

            IWebElement resultElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("cheddar", resultElement.Text, "Should have picked the third option only.");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE reports [0,0] as location for <option> elements")]
        public void ShiftClickingOnMultiSelectionList()
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
        [IgnoreBrowser(Browser.IE, "IE reports [0,0] as location for <option> elements")]
        public void ControlClickingOnMultiSelectionList()
        {
            string controlModifier = Keys.Control;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                controlModifier = Keys.Command;
            }

            driver.Url = formSelectionPage;

            ReadOnlyCollection<IWebElement> options = driver.FindElements(By.TagName("option"));

            Actions actionBuider = new Actions(driver);
            IAction selectThreeOptions = actionBuider.Click(options[1])
                .KeyDown(controlModifier)
                .Click(options[3])
                .KeyUp(controlModifier).Build();

            selectThreeOptions.Perform();

            IWebElement showButton = driver.FindElement(By.Name("showselected"));
            showButton.Click();

            IWebElement resultElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("roquefort cheddar", resultElement.Text, "Should have picked the first and third options.");
        }

        [Test]
        public void ControlClickingOnCustomMultiSelectionList()
        {
            string controlModifier = Keys.Control;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                controlModifier = Keys.Command;
            }

            driver.Url = selectableItemsPage;

            IWebElement reportingElement = driver.FindElement(By.Id("infodiv"));

            Assert.AreEqual("no info", reportingElement.Text);

            ReadOnlyCollection<IWebElement> listItems = driver.FindElements(By.TagName("li"));

            IAction selectThreeItems = new Actions(driver).KeyDown(controlModifier)
                .Click(listItems[1])
                .Click(listItems[3])
                .Click(listItems[5])
                .KeyUp(controlModifier).Build();

            selectThreeItems.Perform();

            Assert.AreEqual("#item2 #item4 #item6", reportingElement.Text);

            // Now click on another element, make sure that's the only one selected.
            new Actions(driver).Click(listItems[6]).Build().Perform();
            Assert.AreEqual("#item7", reportingElement.Text);
        }

        [Test]
        public void CanMoveMouseToAnElementInAnIframeAndClick()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/click_in_iframe.html");

            WaitFor<IWebElement>(() => driver.FindElement(By.Id("ifr")), "Did not find element");
            driver.SwitchTo().Frame("ifr");

            try
            {
                IWebElement link = driver.FindElement(By.Id("link"));

                new Actions(driver)
                    .MoveToElement(link)
                    .Click()
                    .Perform();

                WaitFor(() => driver.Title == "Submitted Successfully!", "Browser title not correct");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        public void CanClickOnLinks()
        {
            this.NavigateToClicksPageAndClickLink();
        }

        [Test]
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

        [Test]
        public void ClickAfterMoveToAnElementWithAnOffsetShouldUseLastMousePosition()
        {
            driver.Url = clickEventPage;

            IWebElement element = driver.FindElement(By.Id("eventish"));
            Point location = element.Location;
            Size size = element.Size;

            new Actions(driver)
                .MoveToElement(element, 20 - size.Width / 2, 10 - size.Height / 2)
                .Click()
                .Perform();

            WaitFor<IWebElement>(() => driver.FindElement(By.Id("pageX")), "Did not find element with ID pageX");

            // This will fail for IE 9 or earlier. The correct code would look something like
            // this:
            // int x;
            // int y;
            // if (TestUtilities.IsInternetExplorer(driver) && !TestUtilities.IsIE10OrHigher(driver))
            //{
            //    x = int.Parse(driver.FindElement(By.Id("clientX")).Text);
            //    y = int.Parse(driver.FindElement(By.Id("clientY")).Text);
            //}
            //else
            //{
            //    x = int.Parse(driver.FindElement(By.Id("pageX")).Text);
            //    y = int.Parse(driver.FindElement(By.Id("pageY")).Text);
            //}
            int x = int.Parse(driver.FindElement(By.Id("pageX")).Text);
            int y = int.Parse(driver.FindElement(By.Id("pageY")).Text);

            Assert.That(FuzzyPositionMatching(location.X + 20, location.Y + 10, string.Format("{0},{1}", x, y)), Is.True);
        }

        /**
         * This test demonstrates the following problem: When the representation of
         * the mouse in the driver keeps the wrong state, mouse movement will end
         * up at the wrong coordinates.
         */
        [Test]
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
        public void ChordControlCutAndPaste()
        {
            string controlModifier = Keys.Control;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                controlModifier = Keys.Command;
            }

            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            // Must scroll element into view for W3C-compliant drivers.
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView()", element);

            new Actions(driver)
                .SendKeys(element, "abc def")
                .Perform();

            Assert.AreEqual("abc def", element.GetAttribute("value"));

            //TODO: Figure out why calling sendKey(Key.CONTROL + "a") and then
            //sendKeys("x") does not work on Linux.
            new Actions(driver).KeyDown(controlModifier)
                .SendKeys("a" + "x")
                .Perform();

            // Release keys before next step.
            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual(string.Empty, element.GetAttribute("value"));

            new Actions(driver).KeyDown(controlModifier)
                .SendKeys("v")
                .SendKeys("v")
                .Perform();

            new Actions(driver).SendKeys(Keys.Null).Perform();

            Assert.AreEqual("abc defabc def", element.GetAttribute("value"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void CombiningShiftAndClickResultsInANewWindow()
        {
            driver.Url = linkedImage;
            IWebElement link = driver.FindElement(By.Id("link"));
            string originalTitle = driver.Title;

            new Actions(driver)
                .MoveToElement(link)
                .KeyDown(Keys.Shift)
                .Click()
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
        public void HoldingDownShiftKeyWhileClicking()
        {
            driver.Url = clickEventPage;

            IWebElement toClick = driver.FindElement(By.Id("eventish"));

            new Actions(driver).MoveToElement(toClick).KeyDown(Keys.Shift).Click().KeyUp(Keys.Shift).Perform();

            IWebElement shiftInfo = WaitFor(() => { return driver.FindElement(By.Id("shiftKey")); }, "Could not find element with id 'shiftKey'");
            Assert.AreEqual("true", shiftInfo.Text);
        }

        [Test]
        public void CanClickOnSuckerFishStyleMenu()
        {
            driver.Url = javascriptPage;

            // Move to a different element to make sure the mouse is not over the
            // element with id 'item1' (from a previous test).
            new Actions(driver).MoveToElement(driver.FindElement(By.Id("dynamo"))).Build().Perform();

            IWebElement element = driver.FindElement(By.Id("menu1"));

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
        public void CanClickOnSuckerFishMenuItem()
        {
            driver.Url = javascriptPage;

            // Move to a different element to make sure the mouse is not over the
            // element with id 'item1' (from a previous test).
            new Actions(driver).MoveToElement(driver.FindElement(By.Id("dynamo"))).Build().Perform();

            IWebElement element = driver.FindElement(By.Id("menu1"));

            new Actions(driver).MoveToElement(element).Build().Perform();

            IWebElement target = driver.FindElement(By.Id("item1"));

            Assert.That(target.Displayed, "Target element was not displayed");
            target.Click();

            IWebElement result = driver.FindElement(By.Id("result"));
            WaitFor(() => { return result.Text.Contains("item 1"); }, "Result element does not contain text 'item 1'");
        }

        [Test]
        public void PerformsPause()
        {
            DateTime start = DateTime.Now;
            new Actions(driver).Pause(TimeSpan.FromMilliseconds(1200)).Build().Perform();
            Assert.IsTrue(DateTime.Now - start > TimeSpan.FromMilliseconds(1200));
        }

        private bool FuzzyPositionMatching(int expectedX, int expectedY, string locationTuple)
        {
            string[] splitString = locationTuple.Split(',');
            int gotX = int.Parse(splitString[0].Trim());
            int gotY = int.Parse(splitString[1].Trim());

            // Everything within 5 pixels range is OK
            const int ALLOWED_DEVIATION = 5;
            return Math.Abs(expectedX - gotX) < ALLOWED_DEVIATION && Math.Abs(expectedY - gotY) < ALLOWED_DEVIATION;
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
    }
}
