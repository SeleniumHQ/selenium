using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class WindowTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Opera, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "Not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "Not implemented in driver")]
        public void ShouldBeAbleToGetTheSizeOfTheCurrentWindow()
        {
            Size size = driver.Manage().Window.Size;
            Console.WriteLine("Window size: {0}, {1}", size.Width, size.Height);
            Assert.Greater(size.Width, 0);
            Assert.Greater(size.Height, 0);
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Opera, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "Not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "Not implemented in driver")]
        public void ShouldBeAbleToSetTheSizeOfTheCurrentWindow()
        {
            IWindow window = driver.Manage().Window;
            Size size = window.Size;
            Console.WriteLine("Window size: {0}, {1}", size.Width, size.Height);

            // resize relative to the initial size, since we don't know what it is
            Size targetSize = new Size(size.Width - 20, size.Height - 20);
            window.Size = targetSize;

            Size newSize = window.Size;
            Console.WriteLine("Window size: {0}, {1}", newSize.Width, newSize.Height);
            Assert.AreEqual(targetSize.Width, newSize.Width);
            Assert.AreEqual(targetSize.Height, newSize.Height);
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Opera, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "Not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "Not implemented in driver")]
        public void ShouldBeAbleToGetThePositionOfTheCurrentWindow()
        {
            Point position = driver.Manage().Window.Position;
            Console.WriteLine("Window postion: {0}, {1}", position.X, position.Y);
            Assert.Greater(position.X, 0);
            Assert.Greater(position.Y, 0);
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Opera, "Not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "Not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "Not implemented in driver")]
        public void ShouldBeAbleToSetThePositionOfTheCurrentWindow()
        {
            IWindow window = driver.Manage().Window;
            Point position = window.Position;
            Console.WriteLine("Window postion: {0}, {1}", position.X, position.Y);
           
            Point targetPosition = new Point(position.X + 10, position.Y + 10);
            window.Position = targetPosition;

            Point newLocation = window.Position;
            Console.WriteLine("Window postion: {0}, {1}", newLocation.X, newLocation.Y);

            Assert.AreEqual(targetPosition.X, newLocation.X);
            Assert.AreEqual(targetPosition.Y, newLocation.Y);
        }
    }
}