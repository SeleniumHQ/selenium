using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetAllWindowTitles : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string current = driver.GetWindowHandle();

            List<string> attributes = new List<string>();
            foreach (string handle in driver.GetWindowHandles())
            {
                driver.SwitchTo().Window(handle);
                attributes.Add(driver.Title);
            }

            driver.SwitchTo().Window(current);

            return attributes.ToArray();
        }
    }
}
