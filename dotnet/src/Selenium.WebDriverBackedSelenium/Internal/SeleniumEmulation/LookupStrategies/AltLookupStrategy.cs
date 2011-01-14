using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class AltLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.XPath("//*[@alt='" + use + "']"));
        }
    }
}
