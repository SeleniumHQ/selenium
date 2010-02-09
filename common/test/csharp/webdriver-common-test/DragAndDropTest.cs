using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DragAndDropTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void DragAndDrop()
        {
            driver.Url = dragAndDropPage;
            IRenderedWebElement img = (IRenderedWebElement)driver.FindElement(By.Id("test1"));
            Point expectedLocation = drag(img, img.Location, 150, 200);
            Assert.AreEqual(expectedLocation, img.Location);
            driver.Manage().Speed = Speed.Slow;
            expectedLocation = drag(img, img.Location, -50, -25);
            Assert.AreEqual(expectedLocation, img.Location);
            driver.Manage().Speed = Speed.Medium;
            expectedLocation = drag(img, img.Location, 0, 0);
            Assert.AreEqual(expectedLocation, img.Location);
            driver.Manage().Speed = Speed.Fast;
            expectedLocation = drag(img, img.Location, 1, -1);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void DragAndDropToElement()
        {
            driver.Url = dragAndDropPage;
            IRenderedWebElement img1 = (IRenderedWebElement)driver.FindElement(By.Id("test1"));
            IRenderedWebElement img2 = (IRenderedWebElement)driver.FindElement(By.Id("test2"));
            img2.DragAndDropOn(img1);
            Assert.AreEqual(img1.Location, img2.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void ElementInDiv()
        {
            driver.Url = dragAndDropPage;
            IRenderedWebElement img = (IRenderedWebElement)driver.FindElement(By.Id("test3"));
            Point expectedLocation = drag(img, img.Location, 100, 100);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Dragging too far in IE causes the element not to move, instead of moving to 0,0.")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void DragTooFar()
        {
            driver.Url = dragAndDropPage;
            IRenderedWebElement img = (IRenderedWebElement)driver.FindElement(By.Id("test1"));

            // Dragging too far left and up does not move the element. It will be at 
            // its original location after the drag.
            Point originalLocation = new Point(0, 0);
            img.DragAndDropBy(int.MinValue, int.MinValue);
            Assert.AreEqual(originalLocation, img.Location);

            img.DragAndDropBy(int.MaxValue, int.MaxValue);
            //We don't know where the img is dragged to , but we know it's not too
            //far, otherwise this function will not return for a long long time
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void MouseSpeed()
        {
            driver.Url = dragAndDropPage;
            driver.Manage().Speed = Speed.Slow;
            Assert.AreEqual(Speed.Slow, driver.Manage().Speed);
            driver.Manage().Speed = Speed.Medium;
            Assert.AreEqual(Speed.Medium, driver.Manage().Speed);
            driver.Manage().Speed = Speed.Fast;
            Assert.AreEqual(Speed.Fast, driver.Manage().Speed);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE, "Location property not taking scroll position into account")]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort()
        {
            driver.Url = dragAndDropPage;

            IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
            int height = Convert.ToInt32(js.ExecuteScript("return window.outerHeight;"));
            int width = Convert.ToInt32(js.ExecuteScript("return window.outerWidth;"));
            js.ExecuteScript("window.resizeTo(300, 300);");

            try
            {
                driver.Url = dragAndDropPage;
                IRenderedWebElement img = (IRenderedWebElement)driver.FindElement(By.Id("test3"));
                Point expectedLocation = drag(img, img.Location, 100, 100);
                Assert.AreEqual(expectedLocation, img.Location);
            }
            finally
            {
                js.ExecuteScript("window.resizeTo(arguments[0], arguments[1]);", width, height);
            }
        }

        private Point drag(IRenderedWebElement elem, Point initialLocation, int moveRightBy, int moveDownBy)
        {
            Point expectedLocation = new Point(initialLocation.X, initialLocation.Y);
            elem.DragAndDropBy(moveRightBy, moveDownBy);
            expectedLocation.Offset(moveRightBy, moveDownBy);
            return expectedLocation;
        }
    }
}
