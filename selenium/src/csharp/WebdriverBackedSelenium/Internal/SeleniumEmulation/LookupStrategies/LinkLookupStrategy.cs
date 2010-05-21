using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class LinkLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.LinkText(use));
        }
    }
}
