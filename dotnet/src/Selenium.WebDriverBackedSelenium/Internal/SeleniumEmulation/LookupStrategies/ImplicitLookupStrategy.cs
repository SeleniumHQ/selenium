
using System;
using OpenQA.Selenium;

namespace Selenium
{
    internal class ImplicitLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            if (use.StartsWith("document.", StringComparison.Ordinal))
            {
                return new DomTraversalLookupStrategy().Find(driver, use);
            }
            else if (use.StartsWith("//", StringComparison.Ordinal))
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
