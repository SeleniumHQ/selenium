using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetAllLinks : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            ReadOnlyCollection<IWebElement> allInputs = driver.FindElements(By.XPath("//a"));
            List<string> ids = new List<string>();

            foreach (IWebElement input in allInputs)
            {
                string elementId = input.GetAttribute("id");
                if (string.IsNullOrEmpty(elementId))
                {
                    ids.Add(string.Empty);
                }
                else
                {
                    ids.Add(elementId);
                }
            }

            return ids.ToArray();
        }
    }
}
