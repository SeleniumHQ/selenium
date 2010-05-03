using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public class LabelOptionSelectStrategy : BaseOptionSelectStragety
    {
        protected override bool SelectOption(IWebElement option, string selectThis)
        {
            return selectThis.Equals(option.Text);
        }
    }
}