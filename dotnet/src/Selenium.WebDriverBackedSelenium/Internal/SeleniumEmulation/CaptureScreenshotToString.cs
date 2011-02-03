using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the captureScreenshotToString keyword.
    /// </summary>
    internal class CaptureScreenshotToString : SeleneseCommand
    {
        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
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
