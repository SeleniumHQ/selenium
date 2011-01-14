using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class ClassLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            return driver.FindElement(By.ClassName(use));
        }
    }
}
