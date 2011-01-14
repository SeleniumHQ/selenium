using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the attachFile keyword.
    /// </summary>
    internal class AttachFile : SeleneseCommand
    {
        private ElementFinder finder;

        public AttachFile(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            element.Clear();

            throw new InvalidOperationException("attachFile");
        }
    }
}
