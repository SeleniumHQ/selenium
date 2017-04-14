using System;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Drawing;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    [IgnoreBrowser(Browser.Safari, "Not implemented (issue 4136)")]
    public class BasicMouseInterfaceTest : DriverTestFixture
    {
        [SetUp]
        public void SetupTest()
        {
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowDraggingElementWithMouseMovesItToAnotherList()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragInto = driver.FindElement(By.Id("sortable1"));
            Assert.AreEqual(6, dragInto.FindElements(By.TagName("li")).Count);
        }

        // This test is very similar to DraggingElementWithMouse. The only
        // difference is that this test also verifies the correct events were fired.
        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void DraggingElementWithMouseFiresEvents()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));
            // This is failing under HtmlUnit. A bug was filed.
            Assert.IsTrue(Regex.IsMatch(dragReporter.Text, "Nothing happened\\. (?:DragOut *)+DropIn RightItem 3"));
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowDoubleClickThenNavigate()
        {
            driver.Url = javascriptPage;

            IWebElement toDoubleClick = driver.FindElement(By.Id("doubleClickField"));

            Actions actionProvider = new Actions(driver);
            IAction dblClick = actionProvider.DoubleClick(toDoubleClick).Build();

            dblClick.Perform();
            driver.Url = droppableItems;
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowDragAndDrop()
        {
            driver.Url = droppableItems;

            DateTime waitEndTime = DateTime.Now.Add(TimeSpan.FromSeconds(15));

            while (!IsElementAvailable(driver, By.Id("draggable")) && (DateTime.Now < waitEndTime))
            {
                System.Threading.Thread.Sleep(200);
            }

            if (!IsElementAvailable(driver, By.Id("draggable")))
            {
                throw new Exception("Could not find draggable element after 15 seconds.");
            }

            IWebElement toDrag = driver.FindElement(By.Id("draggable"));
            IWebElement dropInto = driver.FindElement(By.Id("droppable"));

            Actions actionProvider = new Actions(driver);

            IAction holdDrag = actionProvider.ClickAndHold(toDrag).Build();

            IAction move = actionProvider.MoveToElement(dropInto).Build();

            IAction drop = actionProvider.Release(dropInto).Build();

            holdDrag.Perform();
            move.Perform();
            drop.Perform();

            dropInto = driver.FindElement(By.Id("droppable"));
            string text = dropInto.FindElement(By.TagName("p")).Text;

            Assert.AreEqual("Dropped!", text);
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowDoubleClick()
        {
            driver.Url = javascriptPage;

            IWebElement toDoubleClick = driver.FindElement(By.Id("doubleClickField"));

            Actions actionProvider = new Actions(driver);
            IAction dblClick = actionProvider.DoubleClick(toDoubleClick).Build();

            dblClick.Perform();
            Assert.AreEqual("DoubleClicked", toDoubleClick.GetAttribute("value"));
        }

        [Test]
        //[IgnoreBrowser(Browser.Chrome, "ChromeDriver2 does not perform this yet")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowContextClick()
        {
            driver.Url = javascriptPage;

            IWebElement toContextClick = driver.FindElement(By.Id("doubleClickField"));

            Actions actionProvider = new Actions(driver);
            IAction contextClick = actionProvider.ContextClick(toContextClick).Build();

            contextClick.Perform();
            Assert.AreEqual("ContextClicked", toContextClick.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldAllowMoveAndClick()
        {
            driver.Url = javascriptPage;

            IWebElement toClick = driver.FindElement(By.Id("clickField"));

            Actions actionProvider = new Actions(driver);
            IAction contextClick = actionProvider.MoveToElement(toClick).Click().Build();

            contextClick.Perform();
            Assert.AreEqual("Clicked", toClick.GetAttribute("value"), "Value should change to Clicked.");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Clicking without context is perfectly valid for W3C-compliant remote ends.")]
        [IgnoreBrowser(Browser.Firefox, "Clicking without context is perfectly valid for W3C-compliant remote ends.")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldNotMoveToANullLocator()
        {
            driver.Url = javascriptPage;

            try
            {
                IAction contextClick = new Actions(driver).MoveToElement(null).Build();

                contextClick.Perform();
                Assert.Fail("Shouldn't be allowed to click on null element.");
            }
            catch (ArgumentException)
            {
                // Expected.
            }

            try
            {
                new Actions(driver).Click().Build().Perform();
                Assert.Fail("Shouldn't be allowed to click without a context.");
            }
            catch (Exception)
            {
                // expected
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Opera, "API not implemented in driver")]
        public void ShouldClickElementInIFrame()
        {
            driver.Url = clicksPage;
            try
            {
                driver.SwitchTo().Frame("source");
                IWebElement element = driver.FindElement(By.Id("otherframe"));
                new Actions(driver).MoveToElement(element).Click().Perform();
                driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");
                WaitFor(() => { return driver.FindElement(By.Id("span")).Text == "An inline element"; }, "Could not find element with text 'An inline element'");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void ShouldAllowUsersToHoverOverElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            if (inputDevicesDriver == null)
            {
                return;
            }

            IWebElement item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("", item.Text);

            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            //element.Hover();
            Actions actionBuilder = new Actions(driver);
            actionBuilder.MoveToElement(element).Perform();

            item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void MovingMouseByRelativeOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            new Actions(driver).MoveToElement(trackerDiv).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 50, 200), "Coordinate matching was not within tolerance");

            new Actions(driver).MoveByOffset(10, 20).Build().Perform();

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 60, 220), "Coordinate matching was not within tolerance");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void MovingMouseToRelativeElementOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            new Actions(driver).MoveToElement(trackerDiv, 95, 195).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 95, 195), "Coordinate matching was not within tolerance");
        }

        [Test]
        [Category("Javascript")]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void MoveRelativeToBody()
        {
            driver.Url = mouseTrackerPage;

            new Actions(driver).MoveByOffset(50, 100).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 40, 20), "Coordinate matching was not within tolerance");
        }

        [Test]
        [Category("Javascript")]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        [IgnoreBrowser(Browser.Safari, "Advanced user interactions not implemented for Safari")]
        public void CanMouseOverAndOutOfAnElement()
        {
            driver.Url = mouseOverPage;

            IWebElement greenbox = driver.FindElement(By.Id("greenbox"));
            IWebElement redbox = driver.FindElement(By.Id("redbox"));
            Size size = redbox.Size;

            new Actions(driver).MoveToElement(greenbox, 1, 1).Perform();
            Assert.AreEqual("rgba(0, 128, 0, 1)", redbox.GetCssValue("background-color"));

            new Actions(driver).MoveToElement(redbox).Perform();
            Assert.AreEqual("rgba(255, 0, 0, 1)", redbox.GetCssValue("background-color"));

            new Actions(driver).MoveToElement(redbox, size.Width + 2, size.Height + 2).Perform();
            Assert.AreEqual("rgba(0, 128, 0, 1)", redbox.GetCssValue("background-color"));
        }

        private Func<bool> FuzzyMatchingOfCoordinates(IWebElement element, int x, int y)
        {
            return () =>
            {
                return FuzzyPositionMatching(x, y, element.Text);
            };
        }

        private bool FuzzyPositionMatching(int expectedX, int expectedY, String locationTuple)
        {
            string[] splitString = locationTuple.Split(',');
            int gotX = int.Parse(splitString[0].Trim());
            int gotY = int.Parse(splitString[1].Trim());

            // Everything within 5 pixels range is OK
            const int ALLOWED_DEVIATION = 5;
            return Math.Abs(expectedX - gotX) < ALLOWED_DEVIATION && Math.Abs(expectedY - gotY) < ALLOWED_DEVIATION;
        }

        private void PerformDragAndDropWithMouse()
        {
            driver.Url = draggableLists;

            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));

            IWebElement toDrag = driver.FindElement(By.Id("rightitem-3"));
            IWebElement dragInto = driver.FindElement(By.Id("sortable1"));

            IAction holdItem = new Actions(driver).ClickAndHold(toDrag).Build();

            IAction moveToSpecificItem = new Actions(driver).MoveToElement(driver.FindElement(By.Id("leftitem-4"))).Build();

            IAction moveToOtherList = new Actions(driver).MoveToElement(dragInto).Build();

            IAction drop = new Actions(driver).Release(dragInto).Build();

            Assert.AreEqual("Nothing happened.", dragReporter.Text);

            holdItem.Perform();
            moveToSpecificItem.Perform();
            moveToOtherList.Perform();

            Assert.IsTrue(Regex.IsMatch(dragReporter.Text, "Nothing happened\\. (?:DragOut *)+"));
            drop.Perform();
        }

        private bool IsElementAvailable(IWebDriver driver, By locator)
        {
            try
            {
                driver.FindElement(locator);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }
    }
}
