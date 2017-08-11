using System;
using System.IO;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TakesScreenshotTest : DriverTestFixture
    {
        [Test]
        public void ShouldTakeScreenshotsOfThePage()
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
            Assert.IsTrue(File.Exists(filename));
            Assert.IsTrue(new FileInfo(filename).Length > 0);
            File.Delete(filename);
        }

        [Test]
        public void CaptureToBase64()
        {
            ITakesScreenshot screenshotCapableDriver = driver as ITakesScreenshot;
            if (screenshotCapableDriver == null)
            {
                return;
            }

            driver.Url = simpleTestPage;
            Screenshot screenImage = screenshotCapableDriver.GetScreenshot();
            string base64 = screenImage.AsBase64EncodedString;
            Assert.IsTrue(base64.Length > 0);
        }
    }
}
