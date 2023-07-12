using System;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Drawing;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
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
        public void ShouldSetActivePointer()
        {
            Actions actionProvider = new Actions(driver);
            actionProvider.setActivePointer(PointerKind.Mouse, "test mouse");

            PointerInputDevice device = actionProvider.getActivePointer();

            Assert.AreEqual("test mouse", device.DeviceName);
        }

        [Test]
        public void ShouldAllowDraggingElementWithMouseMovesItToAnotherList()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragInto = driver.FindElement(By.Id("sortable1"));
            Assert.AreEqual(6, dragInto.FindElements(By.TagName("li")).Count);
        }

        // This test is very similar to DraggingElementWithMouse. The only
        // difference is that this test also verifies the correct events were fired.
        [Test]
        public void DraggingElementWithMouseFiresEvents()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));
            // This is failing under HtmlUnit. A bug was filed.
            Assert.That(dragReporter.Text, Does.Match("Nothing happened\\. (?:DragOut *)+DropIn RightItem 3"));
        }

        [Test]
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
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
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
        public void ShouldMoveToLocation()
        {
            driver.Url = mouseInteractionPage;

            Actions actionProvider = new Actions(driver);
            actionProvider.MoveToLocation(100, 200).Build().Perform();

            IWebElement location = driver.FindElement(By.Id("absolute-location"));
            var coordinates = location.Text.Split(',');
            Assert.AreEqual("100", coordinates[0].Trim());
            Assert.AreEqual("200", coordinates[1].Trim());
        }

        [Test]
        public void ShouldNotMoveToANullLocator()
        {
            driver.Url = javascriptPage;

            Assert.That(() => new Actions(driver).MoveToElement(null).Perform(), Throws.InstanceOf<ArgumentException>());
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Drivers correctly click at current mouse position without another move, preserving mouse position.")]
        [IgnoreBrowser(Browser.Edge, "Drivers correctly click at current mouse position without another move, preserving mouse position.")]
        [IgnoreBrowser(Browser.Firefox, "Drivers correctly click at current mouse position without another move, preserving mouse position.")]
        [IgnoreBrowser(Browser.IE, "Drivers correctly click at current mouse position without another move, preserving mouse position.")]
        [IgnoreBrowser(Browser.Safari, "Drivers correctly click at current mouse position without another move, preserving mouse position.")]
        public void MousePositionIsNotPreservedInActionsChain()
        {
            driver.Url = javascriptPage;
            IWebElement toMoveTo = driver.FindElement(By.Id("clickField"));

            new Actions(driver).MoveToElement(toMoveTo).Perform();
            Assert.That(() => new Actions(driver).Click().Perform(), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        [IgnoreBrowser(Browser.All, "Behaviour not finalized yet regarding linked images.")]
        public void MovingIntoAnImageEnclosedInALink()
        {
            driver.Url = linkedImage;

            // Note: For some reason, the Accessibility API in Firefox will not be available before we
            // click on something. As a work-around, click on a different element just to get going.
            driver.FindElement(By.Id("linkToAnchorOnThisPage")).Click();

            IWebElement linkElement = driver.FindElement(By.Id("linkWithEnclosedImage"));

            // Image is 644 x 41 - move towards the end.
            // Note: The width of the link element itself is correct - 644 pixels. However,
            // the height is 17 pixels and the rectangle containing it is *underneath* the image.
            // For this reason, this action will fail.
            new Actions(driver).MoveToElement(linkElement, 500, 30).Click().Perform();

            WaitFor(TitleToBe("We Arrive Here"), "Title was not expected value");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Edge, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Safari, "Moving outside of view port throws exception in spec-compliant driver")]
        public void MovingMouseBackAndForthPastViewPort()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("veryLargeCanvas.html");

            IWebElement firstTarget = driver.FindElement(By.Id("r1"));
            new Actions(driver).MoveToElement(firstTarget).Click().Perform();

            IWebElement resultArea = driver.FindElement(By.Id("result"));
            String expectedEvents = "First";
            WaitFor(ElementTextToEqual(resultArea, expectedEvents), "Element text did not equal " + expectedEvents);

            // Move to element with id 'r2', at (2500, 50) to (2580, 100)
            new Actions(driver).MoveByOffset(2540 - 150, 75 - 125).Click().Perform();
            expectedEvents += " Second";
            WaitFor(ElementTextToEqual(resultArea, expectedEvents), "Element text did not equal " + expectedEvents);

            // Move to element with id 'r3' at (60, 1500) to (140, 1550)
            new Actions(driver).MoveByOffset(100 - 2540, 1525 - 75).Click().Perform();
            expectedEvents += " Third";
            WaitFor(ElementTextToEqual(resultArea, expectedEvents), "Element text did not equal " + expectedEvents);

            // Move to element with id 'r4' at (220,180) to (320, 230)
            new Actions(driver).MoveByOffset(270 - 100, 205 - 1525).Click().Perform();
            expectedEvents += " Fourth";
            WaitFor(ElementTextToEqual(resultArea, expectedEvents), "Element text did not equal " + expectedEvents);
        }

        [Test]
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
        public void ShouldAllowUsersToHoverOverElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IWebElement item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("", item.Text);

            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            Actions actionBuilder = new Actions(driver);
            actionBuilder.MoveToElement(element).Perform();

            item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
        public void HoverPersists()
        {
            driver.Url = javascriptPage;
            // Move to a different element to make sure the mouse is not over the
            // element with id 'item1' (from a previous test).
            new Actions(driver).MoveToElement(driver.FindElement(By.Id("dynamo"))).Perform();

            IWebElement element = driver.FindElement(By.Id("menu1"));

            IWebElement item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual(string.Empty, item.Text);

            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            new Actions(driver).MoveToElement(element).Perform();

            // Intentionally wait to make sure hover persists.
            System.Threading.Thread.Sleep(2000);

            WaitFor(ElementTextToNotEqual(item, ""), "Element text was empty after timeout");

            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
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
        public void MovingMouseToRelativeElementOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            Size size = trackerDiv.Size;

            new Actions(driver).MoveToElement(trackerDiv, 95 - size.Width / 2, 195 - size.Height / 2).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 95, 195), "Coordinate matching was not within tolerance");
        }

        [Test]
        public void MovingMouseToRelativeZeroElementOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            Size size = trackerDiv.Size;

            new Actions(driver).MoveToElement(trackerDiv, -size.Width / 2, -size.Height / 2).Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 0, 0), "Coordinate matching was not within tolerance");
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void MoveRelativeToBody()
        {
            driver.Url = mouseTrackerPage;

            new Actions(driver).MoveByOffset(50, 100).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 40, 20), "Coordinate matching was not within tolerance");
        }

        [Test]
        public void MoveMouseByOffsetOverAndOutOfAnElement()
        {
            driver.Url = mouseOverPage;

            IWebElement greenbox = driver.FindElement(By.Id("greenbox"));
            IWebElement redbox = driver.FindElement(By.Id("redbox"));
            Point greenboxPosition = greenbox.Location;
            Point redboxPosition = redbox.Location;
            int shiftX = redboxPosition.X - greenboxPosition.X;
            int shiftY = redboxPosition.Y - greenboxPosition.Y;

            Size greenBoxSize = greenbox.Size;
            int xOffset = 2 - greenBoxSize.Width / 2;
            int yOffset = 2 - greenBoxSize.Height / 2;

            new Actions(driver).MoveToElement(greenbox, xOffset, yOffset).Perform();
            WaitFor(ElementColorToBe(redbox, Color.Green), "element color was not green");

            new Actions(driver).MoveToElement(greenbox, xOffset, yOffset).MoveByOffset(shiftX, shiftY).Perform();
            WaitFor(ElementColorToBe(redbox, Color.Red), "element color was not red");

            new Actions(driver).MoveToElement(greenbox, xOffset, yOffset).MoveByOffset(shiftX, shiftY).MoveByOffset(-shiftX, -shiftY).Perform();
            WaitFor(ElementColorToBe(redbox, Color.Green), "element color was not red");
        }

        [Test]
        public void CanMouseOverAndOutOfAnElement()
        {
            driver.Url = mouseOverPage;

            IWebElement greenbox = driver.FindElement(By.Id("greenbox"));
            IWebElement redbox = driver.FindElement(By.Id("redbox"));
            Size greenSize = greenbox.Size;
            Size redSize = redbox.Size;

            new Actions(driver).MoveToElement(greenbox, 1 - greenSize.Width / 2, 1 - greenSize.Height / 2).Perform();
            Assert.That(redbox.GetCssValue("background-color"), Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));

            new Actions(driver).MoveToElement(redbox).Perform();
            Assert.That(redbox.GetCssValue("background-color"), Is.EqualTo("rgba(255, 0, 0, 1)").Or.EqualTo("rgb(255, 0, 0)"));

            new Actions(driver).MoveToElement(redbox, redSize.Width / 2 + 2, redSize.Height / 2 + 2).Perform();
            Assert.That(redbox.GetCssValue("background-color"), Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));
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
            int gotX = Convert.ToInt16(Math.Round(Convert.ToDouble(splitString[0].Trim())));
            int gotY = Convert.ToInt16(Math.Round(Convert.ToDouble(splitString[1].Trim())));

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

            Assert.That(dragReporter.Text, Does.Match("Nothing happened\\. (?:DragOut *)+"));
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

        private Func<bool> TitleToBe(string desiredTitle)
        {
            return () => driver.Title == desiredTitle;
        }

        private Func<bool> ValueToBe(IWebElement element, string desiredValue)
        {
            return () => element.GetDomProperty("value") == desiredValue;
        }

        private Func<bool> ElementTextToEqual(IWebElement element, string text)
        {
            return () => element.Text == text;
        }

        private Func<bool> ElementTextToNotEqual(IWebElement element, string text)
        {
            return () => element.Text != text;
        }

        private Func<bool> ElementColorToBe(IWebElement element, Color color)
        {
            return () =>
            {
                string rgb = string.Format("rgb({0}, {1}, {2})", color.R, color.G, color.B);
                string rgba = string.Format("rgba({0}, {1}, {2}, 1)", color.R, color.G, color.B);
                string value = element.GetCssValue("background-color");
                return value == rgb || value == rgba;
            };
        }
    }
}
