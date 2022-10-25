using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TakesScreenshotTest : DriverTestFixture
    {
        [TearDown]
        public void SwitchToTop()
        {
            driver.SwitchTo().DefaultContent();
        }

        [Test]
        public void GetScreenshotAsFile()
        {
            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = simpleTestPage;

            string filename = Path.Combine(Path.GetTempPath(), "snapshot" + new Random().Next().ToString() + ".png");
            Screenshot screenImage = screenshotCapableDriver.GetScreenshot();
            screenImage.SaveAsFile(filename, ScreenshotImageFormat.Png);
            Assert.That(File.Exists(filename), Is.True);
            Assert.That(new FileInfo(filename).Length, Is.GreaterThan(0));
            File.Delete(filename);
        }

        [Test]
        public void GetScreenshotAsBase64()
        {
            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = simpleTestPage;
            Screenshot screenImage = screenshotCapableDriver.GetScreenshot();
            string base64 = screenImage.AsBase64EncodedString;
            Assert.That(base64.Length, Is.GreaterThan(0));
        }

        [Test]
        public void GetScreenshotAsBinary()
        {
            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = simpleTestPage;
            Screenshot screenImage = screenshotCapableDriver.GetScreenshot();
            byte[] bytes = screenImage.AsByteArray;
            Assert.That(bytes.Length, Is.GreaterThan(0));
        }

        [Test]
        public void ShouldCaptureScreenshotOfCurrentViewport()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen.html");
            Screenshot screenshot = screenshotCapableDriver.GetScreenshot();

            HashSet<string> actualColors = ScanActualColors(screenshot,
                                                        /* stepX in pixels */ 5,
                                                        /* stepY in pixels */ 5);

            HashSet<string> expectedColors = GenerateExpectedColors( /* initial color */ 0x0F0F0F,
                                                                 /* color step */ 1000,
                                                                 /* grid X size */ 6,
                                                                 /* grid Y size */ 6);

            CompareColors(expectedColors, actualColors);
        }

        [Test]
        public void ShouldTakeScreenshotsOfAnElement()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen.html");
            IWebElement element = driver.FindElement(By.Id("cell11"));

            ITakesScreenshot screenshotCapableElement = element as ITakesScreenshot;
            if (screenshotCapableElement == null)
            {
                return;
            }

            Screenshot screenImage = screenshotCapableElement.GetScreenshot();
            byte[] imageData = screenImage.AsByteArray;
            Assert.That(imageData, Is.Not.Null);
            Assert.That(imageData.Length, Is.GreaterThan(0));

            Color pixelColor = GetPixelColor(screenImage, 1, 1);
            string pixelColorString = FormatColorToHex(pixelColor.ToArgb());
            Assert.AreEqual("#0f12f7", pixelColorString);
        }

        [Test]
        public void ShouldCaptureScreenshotAtFramePage()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen_frames.html");
            WaitFor(FrameToBeAvailableAndSwitchedTo("frame1"), "Did not switch to frame1");
            WaitFor(ElementToBeVisibleWithId("content"), "Did not find visible element with id content");

            driver.SwitchTo().DefaultContent();
            WaitFor(FrameToBeAvailableAndSwitchedTo("frame2"), "Did not switch to frame2");
            WaitFor(ElementToBeVisibleWithId("content"), "Did not find visible element with id content");

            driver.SwitchTo().DefaultContent();
            WaitFor(TitleToBe("screen test"), "Title was not expected value");
            Screenshot screenshot = screenshotCapableDriver.GetScreenshot();

            HashSet<string> actualColors = ScanActualColors(screenshot,
                                                       /* stepX in pixels */ 5,
                                                       /* stepY in pixels */ 5);

            HashSet<string> expectedColors = GenerateExpectedColors( /* initial color */ 0x0F0F0F,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6);
            expectedColors.UnionWith(GenerateExpectedColors( /* initial color */ 0xDFDFDF,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6));

            // expectation is that screenshot at page with frames will be taken for full page
            CompareColors(expectedColors, actualColors);
        }

        [Test]
        public void ShouldCaptureScreenshotAtIFramePage()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen_iframes.html");

            // Resize the window to avoid scrollbars in screenshot
            Size originalSize = driver.Manage().Window.Size;
            driver.Manage().Window.Size = new Size(1040, 700);

            Screenshot screenshot = screenshotCapableDriver.GetScreenshot();
            driver.Manage().Window.Size = originalSize;

            HashSet<string> actualColors = ScanActualColors(screenshot,
                                                       /* stepX in pixels */ 5,
                                                       /* stepY in pixels */ 5);

            HashSet<string> expectedColors = GenerateExpectedColors( /* initial color */ 0x0F0F0F,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6);
            expectedColors.UnionWith(GenerateExpectedColors( /* initial color */ 0xDFDFDF,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6));

            // expectation is that screenshot at page with Iframes will be taken for full page
            CompareColors(expectedColors, actualColors);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Color comparisons fail on Firefox")]
        public void ShouldCaptureScreenshotAtFramePageAfterSwitching()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen_frames.html");

            driver.SwitchTo().Frame(driver.FindElement(By.Id("frame2")));

            Screenshot screenshot = screenshotCapableDriver.GetScreenshot();

            HashSet<string> actualColors = ScanActualColors(screenshot,
                                                       /* stepX in pixels */ 5,
                                                       /* stepY in pixels */ 5);

            HashSet<string> expectedColors = GenerateExpectedColors( /* initial color */ 0x0F0F0F,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6);
            expectedColors.UnionWith(GenerateExpectedColors( /* initial color */ 0xDFDFDF,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6));

            // expectation is that screenshot at page with frames after switching to a frame
            // will be taken for full page
            CompareColors(expectedColors, actualColors);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Color comparisons fail on Firefox")]
        public void ShouldCaptureScreenshotAtIFramePageAfterSwitching()
        {
#if NETCOREAPP3_1 || NETSTANDARD2_1 || NET5_0
            Assert.Ignore("Skipping test: this framework can not process colors.");
#endif

            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("screen/screen_iframes.html");

            // Resize the window to avoid scrollbars in screenshot
            Size originalSize = driver.Manage().Window.Size;
            driver.Manage().Window.Size = new Size(1040, 700);

            driver.SwitchTo().Frame(driver.FindElement(By.Id("iframe2")));

            Screenshot screenshot = screenshotCapableDriver.GetScreenshot();
            driver.Manage().Window.Size = originalSize;

            HashSet<string> actualColors = ScanActualColors(screenshot,
                                                       /* stepX in pixels */ 5,
                                                       /* stepY in pixels */ 5);

            HashSet<string> expectedColors = GenerateExpectedColors( /* initial color */ 0x0F0F0F,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6);
            expectedColors.UnionWith(GenerateExpectedColors( /* initial color */ 0xDFDFDF,
                                                     /* color step*/ 1000,
                                                     /* grid X size */ 6,
                                                     /* grid Y size */ 6));

            // expectation is that screenshot at page with Iframes after switching to a Iframe
            // will be taken for full page
            CompareColors(expectedColors, actualColors);
        }

        private string FormatColorToHex(int colorValue)
        {
            string pixelColorString = string.Format("#{0:x2}{1:x2}{2:x2}", (colorValue & 0xFF0000) >> 16, (colorValue & 0x00FF00) >> 8, (colorValue & 0x0000FF));
            return pixelColorString;
        }

        private void CompareColors(HashSet<string> expectedColors, HashSet<string> actualColors)
        {
            // Ignore black and white for further comparison
            actualColors.Remove("#000000");
            actualColors.Remove("#ffffff");

            Assert.That(actualColors, Is.EquivalentTo(expectedColors));
        }

        private HashSet<string> GenerateExpectedColors(int initialColor, int stepColor, int numberOfSamplesX, int numberOfSamplesY)
        {
            HashSet<string> colors = new HashSet<string>();
            int count = 1;
            for (int i = 1; i < numberOfSamplesX; i++)
            {
                for (int j = 1; j < numberOfSamplesY; j++)
                {
                    int color = initialColor + (count * stepColor);
                    string hex = FormatColorToHex(color);
                    colors.Add(hex);
                    count++;
                }
            }

            return colors;
        }

        private HashSet<string> ScanActualColors(Screenshot screenshot, int stepX, int stepY)
        {
            HashSet<string> colors = new HashSet<string>();

#if !NETCOREAPP3_1 && !NETSTANDARD2_1 && !NET5_0
            try
            {
                Image image = Image.FromStream(new MemoryStream(screenshot.AsByteArray));
                Bitmap bitmap = new Bitmap(image);
                int height = bitmap.Height;
                int width = bitmap.Width;
                Assert.That(width, Is.GreaterThan(0));
                Assert.That(height, Is.GreaterThan(0));

                for (int i = 0; i < width; i = i + stepX)
                {
                    for (int j = 0; j < height; j = j + stepY)
                    {
                        string hex = FormatColorToHex(bitmap.GetPixel(i, j).ToArgb());
                        colors.Add(hex);
                    }
                }
            }
            catch (Exception e)
            {
                Assert.Fail("Unable to get actual colors from screenshot: " + e.Message);
            }

            Assert.That(colors.Count, Is.GreaterThan(0));
#endif

            return colors;
        }

        private Color GetPixelColor(Screenshot screenshot, int x, int y)
        {
            Color pixelColor = Color.Black;

#if !NETCOREAPP3_1 && !NETSTANDARD2_1 && !NET5_0
            Image image = Image.FromStream(new MemoryStream(screenshot.AsByteArray));
            Bitmap bitmap = new Bitmap(image);
            pixelColor = bitmap.GetPixel(1, 1);
#endif
            return pixelColor;
        }

        private Func<bool> FrameToBeAvailableAndSwitchedTo(string frameId)
        {
            return () =>
            {
                try
                {
                    IWebElement frameElement = driver.FindElement(By.Id(frameId));
                    driver.SwitchTo().Frame(frameElement);
                }
                catch(Exception)
                {
                    return false;
                }

                return true;
            };
        }

        private Func<bool> ElementToBeVisibleWithId(string elementId)
        {
            return () =>
            {
                try
                {
                    IWebElement element = driver.FindElement(By.Id(elementId));
                    return element.Displayed;
                }
                catch(Exception)
                {
                    return false;
                }
            };
        }

        private Func<bool> TitleToBe(string desiredTitle)
        {
            return () => driver.Title == desiredTitle;
        }
    }
}
