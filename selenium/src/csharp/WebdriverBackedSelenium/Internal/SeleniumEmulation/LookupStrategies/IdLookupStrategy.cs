
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class IdLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            return driver.FindElement(By.Id(use));
        }
    }
}
