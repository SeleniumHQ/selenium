using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class BasicMouseInterfaceTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
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
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void DraggingElementWithMouseFiresEvents()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));
            // This is failing under HtmlUnit. A bug was filed.
            Assert.IsTrue(Regex.IsMatch(dragReporter.Text, "Nothing happened\\. (?:DragOut *)+DropIn RightItem 3"));
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
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
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
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
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
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
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Safari, "API not implemented in driver")]
        public void ShouldNotMoveToANullLocator()
        {
            driver.Url = javascriptPage;

            Actions actionProvider = new Actions(driver);
            try
            {
                IAction contextClick = actionProvider.MoveToElement(null).Build();

                contextClick.Perform();
                Assert.Fail("Shouldn't be allowed to click on null element.");
            }
            catch (ArgumentException)
            {
                // Expected.
            }

            try
            {
                actionProvider.Click().Build().Perform();
                Assert.Fail("Shouldn't be allowed to click without a context.");
            }
            catch (Exception)
            {
                // expected
            }
        }

        private void PerformDragAndDropWithMouse()
        {
            driver.Url = draggableLists;

            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));

            IWebElement toDrag = driver.FindElement(By.Id("rightitem-3"));
            IWebElement dragInto = driver.FindElement(By.Id("sortable1"));

            Actions actionProvider = new Actions(driver);
            IAction holdItem = actionProvider.ClickAndHold(toDrag).Build();

            IAction moveToSpecificItem = actionProvider.MoveToElement(driver.FindElement(By.Id("leftitem-4"))).Build();

            IAction moveToOtherList = actionProvider.MoveToElement(dragInto).Build();

            IAction drop = actionProvider.Release(dragInto).Build();

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
