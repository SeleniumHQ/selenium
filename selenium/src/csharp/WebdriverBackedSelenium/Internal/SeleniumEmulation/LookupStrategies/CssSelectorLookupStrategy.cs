using OpenQA.Selenium;

namespace Selenium
{
    internal class CssSelectorLookupStrategy : ILookupStrategy
    {
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.CssSelector(use));
        }
    }
}