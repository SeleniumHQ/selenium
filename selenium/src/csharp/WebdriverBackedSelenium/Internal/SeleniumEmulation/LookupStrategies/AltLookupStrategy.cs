
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class AltLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.XPath("//*[@alt='" + use + "']"));
        }
    }
}
