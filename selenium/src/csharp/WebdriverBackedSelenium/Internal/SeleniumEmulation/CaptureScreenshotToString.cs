using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class CaptureScreenshotToString : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string screenshot = string.Empty;
            ITakesScreenshot screenshotDriver = driver as ITakesScreenshot;
            if (screenshotDriver != null)
            {
                screenshot = screenshotDriver.GetScreenshot().AsBase64EncodedString;
            }

            return screenshot;
        }
    }
}
