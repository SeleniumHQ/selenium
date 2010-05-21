using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class XPathLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.XPath(use));
        }
    }
}
