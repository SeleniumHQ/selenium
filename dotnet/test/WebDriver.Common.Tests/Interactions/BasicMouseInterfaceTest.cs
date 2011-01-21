using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Interactions
{
    [Ignore]
    [TestFixture]
    public class BasicMouseInterfaceTest : DriverTestFixture
    {
        [Test]
        public void ShouldAllowDraggingElementWithMouseMovesItToAnotherList()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragInto = driver.FindElement(By.Id("sortable1"));
            Assert.AreEqual(6, dragInto.FindElements(By.TagName("li")).Count);
        }

        // This test is very similar to testDraggingElementWithMouse. The only
        // difference is that this test also verifies the correct events were fired.
        [Test]
        public void testDraggingElementWithMouseFiresEvents()
        {
            PerformDragAndDropWithMouse();
            IWebElement dragReporter = driver.FindElement(By.Id("dragging_reports"));
            // This is failing under HtmlUnit. A bug was filed.
            Assert.AreEqual("Nothing happened. DragOut DropIn RightItem 3", dragReporter.Text);
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

            IAction holdDrag = GetBuilder().ClickAndHold(toDrag).Build();

            IAction move = GetBuilder().MoveToElement(dropInto).Build();

            IAction drop = GetBuilder().Release(dropInto).Build();

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

            IAction dblClick = GetBuilder().DoubleClick(toDoubleClick).Build();

            dblClick.Perform();
            Assert.AreEqual("DoubleClicked", toDoubleClick.Value);
        }

        [Test]
        public void ShouldAllowContextClick()
        {
            driver.Url = javascriptPage;

            IWebElement toContextClick = driver.FindElement(By.Id("doubleClickField"));

            IAction contextClick = GetBuilder().ContextClick(toContextClick).Build();

            contextClick.Perform();
            Assert.AreEqual("ContextClicked", toContextClick.Value);
        }

        [Test]
        public void ShouldAllowMoveAndClick()
        {
            driver.Url = javascriptPage;

            IWebElement toClick = driver.FindElement(By.Id("clickField"));

            IAction contextClick = GetBuilder().MoveToElement(toClick).Click().Build();

            contextClick.Perform();
            Assert.AreEqual("Clicked", toClick.Value, "Value should change to Clicked.");
        }

        [Test]
        public void ShouldNotMoveToANullLocator()
        {
            driver.Url = javascriptPage;

            try
            {
                IAction contextClick = GetBuilder().MoveToElement(null).Build();

                contextClick.Perform();
                Assert.Fail("Shouldn't be allowed to click on null element.");
            }
            catch (ArgumentException)
            {
                // Expected.
            }

            try
            {
                GetBuilder().Click().Build().Perform();
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

            IAction holdItem = GetBuilder().ClickAndHold(toDrag).Build();

            IAction moveToSpecificItem = GetBuilder().MoveToElement(driver.FindElement(By.Id("leftitem-4"))).Build();

            IAction moveToOtherList = GetBuilder().MoveToElement(dragInto).Build();

            IAction drop = GetBuilder().Release(dragInto).Build();

            Assert.AreEqual("Nothing happened.", dragReporter.Text);

            holdItem.Perform();
            moveToSpecificItem.Perform();
            moveToOtherList.Perform();

            Assert.AreEqual("Nothing happened. DragOut", dragReporter.Text);
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

        private IActionSequenceBuilder GetBuilder()
        {
            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            return inputDevicesDriver.ActionBuilder;
        }
    }
}
