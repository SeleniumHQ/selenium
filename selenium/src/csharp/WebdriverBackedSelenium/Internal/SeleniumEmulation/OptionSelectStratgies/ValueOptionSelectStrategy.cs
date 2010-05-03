using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public class ValueOptionSelectStrategy : BaseOptionSelectStragety
    {
        protected override bool SelectOption(IWebElement option, string selectThis)
        {
            return selectThis.Equals(option.Value);
        }
    }
}