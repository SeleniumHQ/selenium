using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DragAndDropTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        public void DragAndDrop()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));
            Point expectedLocation = drag(img, img.Location, 150, 200);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, -50, -25);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, 0, 0);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, 1, -1);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        public void DragAndDropToElement()
        {
            driver.Url = dragAndDropPage;
            IWebElement img1 = driver.FindElement(By.Id("test1"));
            IWebElement img2 = driver.FindElement(By.Id("test2"));
            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDrop(img2, img1).Perform();
            Assert.AreEqual(img1.Location, img2.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        public void ElementInDiv()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test3"));
            Point expectedLocation = drag(img, img.Location, 100, 100);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Dragging too far in IE causes the element not to move, instead of moving to 0,0.")]
        [IgnoreBrowser(Browser.Chrome, "Dragging too far in Chrome causes the element not to move, instead of moving to 0,0.")]
        [IgnoreBrowser(Browser.PhantomJS, "Dragging too far in PhantomJS causes the element not to move, as PhantomJS doesn't support dragging outside the viewport.")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        public void DragTooFar()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));

            // Dragging too far left and up does not move the element. It will be at 
            // its original location after the drag.
            Point originalLocation = new Point(0, 0);
            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(img, int.MinValue, int.MinValue).Perform();
            Point newLocation = img.Location;
            Assert.LessOrEqual(newLocation.X, 0);
            Assert.LessOrEqual(newLocation.Y, 0);

            // TODO(jimevans): re-enable this test once moveto does not exceed the
            // coordinates accepted by the browsers (Firefox in particular). At the
            // moment, even though the maximal coordinates are limited, mouseUp 
            // fails because it cannot get the element at the given coordinates.
            //actionProvider.DragAndDropToOffset(img, int.MaxValue, int.MaxValue).Perform();
            //We don't know where the img is dragged to , but we know it's not too
            //far, otherwise this function will not return for a long long time
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Firefox, "Problem with drag off viewport. See issue #1771")]
        public void ShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort()
        {
            driver.Url = dragAndDropPage;

            IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
            int height = Convert.ToInt32(js.ExecuteScript("return window.outerHeight;"));
            int width = Convert.ToInt32(js.ExecuteScript("return window.outerWidth;"));
            bool mustUseOffsetHeight = width == 0 && height == 0;
            if (mustUseOffsetHeight)
            {
                width = Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;"));
                height = Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;"));
            }

            js.ExecuteScript("window.resizeTo(300, 300);");
            if (mustUseOffsetHeight)
            {
                width = width + 300 - Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;"));
                height = height + 300 - Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;"));
            }

            try
            {
                driver.Url = dragAndDropPage;
                IWebElement img = driver.FindElement(By.Id("test3"));
                Point expectedLocation = drag(img, img.Location, 100, 100);
                Assert.AreEqual(expectedLocation, img.Location);
            }
            finally
            {
                js.ExecuteScript("window.resizeTo(arguments[0], arguments[1]);", width, height);
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        public void DragAndDropOnJQueryItems()
        {
            driver.Url = droppableItems;

            IWebElement toDrag = driver.FindElement(By.Id("draggable"));
            IWebElement dropInto = driver.FindElement(By.Id("droppable"));

            // Wait until all event handlers are installed.
            System.Threading.Thread.Sleep(500);

            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDrop(toDrag, dropInto).Perform();

            string text = dropInto.FindElement(By.TagName("p")).Text;

            DateTime endTime = DateTime.Now.Add(TimeSpan.FromSeconds(15));

            while (text != "Dropped!" && (DateTime.Now < endTime))
            {
                System.Threading.Thread.Sleep(200);
                text = dropInto.FindElement(By.TagName("p")).Text;
            }

            Assert.AreEqual("Dropped!", text);

            IWebElement reporter = driver.FindElement(By.Id("drop_reports"));
            // Assert that only one mouse click took place and the mouse was moved
            // during it.
            string reporterText = reporter.Text;
            Assert.IsTrue(Regex.IsMatch(reporterText, "start( move)* down( move)+ up"));
            Assert.AreEqual(1, Regex.Matches(reporterText, "down").Count, "Reporter text:" + reporterText);
            Assert.AreEqual(1, Regex.Matches(reporterText, "up").Count, "Reporter text:" + reporterText);
            Assert.IsTrue(reporterText.Contains("move"), "Reporter text:" + reporterText);
        }

        private Point drag(IWebElement elem, Point initialLocation, int moveRightBy, int moveDownBy)
        {
            Point expectedLocation = new Point(initialLocation.X, initialLocation.Y);
            expectedLocation.Offset(moveRightBy, moveDownBy);

            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(elem, moveRightBy, moveDownBy).Perform();

            return expectedLocation;
        }
    }
}
