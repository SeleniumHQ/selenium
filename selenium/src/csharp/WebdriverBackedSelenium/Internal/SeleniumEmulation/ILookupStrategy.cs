using OpenQA.Selenium;

namespace Selenium
{
    internal interface ILookupStrategy
    {
        IWebElement Find(IWebDriver driver, string use);
    }
}
