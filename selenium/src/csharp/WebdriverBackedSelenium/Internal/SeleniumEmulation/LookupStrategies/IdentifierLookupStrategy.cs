using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class IdentifierLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            return driver.FindElement(By.Id(use));
        }
    }
}
