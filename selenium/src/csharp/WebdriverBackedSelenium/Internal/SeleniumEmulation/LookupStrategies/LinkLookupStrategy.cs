
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class LinkLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.LinkText(use));
        }
    }
}
