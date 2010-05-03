
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class XPathLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.XPath(use));
        }
    }
}
