using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetLocation : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string ignored, string alsoIgnored)
        {
            return driver.Url;
        }
    }
}
