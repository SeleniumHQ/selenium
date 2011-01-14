using System;
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium
{
    internal class DomTraversalLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                throw new NotSupportedException("DOM lookups only work when the driver supports Javascript");
            }

            return (IWebElement)executor.ExecuteScript(string.Format(CultureInfo.InvariantCulture, "return {0}", use));
        }
    }
}
