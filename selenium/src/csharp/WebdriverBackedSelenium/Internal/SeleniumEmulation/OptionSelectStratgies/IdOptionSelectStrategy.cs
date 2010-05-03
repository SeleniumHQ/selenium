using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public class IdOptionSelectStrategy : BaseOptionSelectStragety
    {
        protected override bool SelectOption(IWebElement option, string selectThis)
        {
            string id = option.GetAttribute("id");
            return selectThis.Equals(id);
        }
    }
}