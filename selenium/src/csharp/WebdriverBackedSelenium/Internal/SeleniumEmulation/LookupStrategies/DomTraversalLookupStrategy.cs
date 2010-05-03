
using System;
using OpenQA.Selenium;

namespace Selenium
{


    public class DomTraversalLookupStrategy : ILookupStrategy
    {
        public OpenQA.Selenium.IWebElement Find(IWebDriver driver, string use)
        {
            if (!(driver is IJavaScriptExecutor))
            {
                throw new NotSupportedException("DOM lookups only work when the driver supports Javascript");
            }
            IJavaScriptExecutor executor = (IJavaScriptExecutor)driver;
            return (IWebElement) executor.ExecuteScript(String.Format("return %s", use));
        }
    }
}
