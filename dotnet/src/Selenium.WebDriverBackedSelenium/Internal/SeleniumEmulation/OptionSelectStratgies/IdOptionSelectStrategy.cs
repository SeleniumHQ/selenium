using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IdOptionSelectStrategy : BaseOptionSelectStrategy
    {
        protected override bool SelectOption(IWebElement optionElement, string selectThis)
        {
            string id = optionElement.GetAttribute("id");
            return selectThis.Equals(id);
        }
    }
}