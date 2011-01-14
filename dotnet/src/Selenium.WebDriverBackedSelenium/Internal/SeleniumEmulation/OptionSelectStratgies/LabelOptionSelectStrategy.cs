using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class LabelOptionSelectStrategy : BaseOptionSelectStrategy
    {
        protected override bool SelectOption(IWebElement optionElement, string selectThis)
        {
            return selectThis.Equals(optionElement.Text);
        }
    }
}