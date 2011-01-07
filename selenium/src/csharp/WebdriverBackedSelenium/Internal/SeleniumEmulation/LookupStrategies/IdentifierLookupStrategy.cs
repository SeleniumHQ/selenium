using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class IdentifierLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            try
            {
                return new IdLookupStrategy().Find(driver, use);
            }
            catch (NoSuchElementException)
            {
                return new NameLookupStrategy().Find(driver, use);
            }
        }
    }
}
