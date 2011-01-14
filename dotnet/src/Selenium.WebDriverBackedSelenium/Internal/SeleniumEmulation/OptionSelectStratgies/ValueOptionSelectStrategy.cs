using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class ValueOptionSelectStrategy : BaseOptionSelectStrategy
    {
        protected override bool SelectOption(IWebElement optionElement, string selectThis)
        {
            return selectThis.Equals(optionElement.Value);
        }
    }
}