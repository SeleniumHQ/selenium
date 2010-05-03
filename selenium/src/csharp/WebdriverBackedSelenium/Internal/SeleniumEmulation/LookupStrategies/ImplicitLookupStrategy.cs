
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class ImplicitLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(IWebDriver driver, string use)
        {
            if (use.StartsWith("document."))
            {
                return new DomTraversalLookupStrategy().Find(driver, use);
            }
            else if (use.StartsWith("//"))
            {
                return new XPathLookupStrategy().Find(driver, use);
            }
            else
            {
                return new IdentifierLookupStrategy().Find(driver, use);
            }
        }
    }
}
