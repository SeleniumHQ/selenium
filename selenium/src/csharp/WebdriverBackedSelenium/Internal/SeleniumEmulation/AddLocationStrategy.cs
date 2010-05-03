using System;
using System.Collections.Generic;
using System.Text;
using Selenium;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class AddLocationStrategy : SeleneseCommand
    {
        private ElementFinder finder;

        public AddLocationStrategy(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            UserLoookupStrategy strategy = new UserLoookupStrategy(value);
            finder.AddStrategy(locator, strategy);

            return null;
        }

        private class UserLoookupStrategy : ILookupStrategy
        {
            private string strategyFunctionDefinition = string.Empty;
            public UserLoookupStrategy(string functionDefinition)
            {
                strategyFunctionDefinition = functionDefinition;
            }

            #region ILookupStrategy Members

            public IWebElement Find(IWebDriver driver, string use)
            {
                string finderScript = string.Format(@"(function(locator, inWindow, inDocument) {{ {0} }}).call(this,'{1}', window, document)", strategyFunctionDefinition, use);
                IJavaScriptExecutor scriptExecutor = driver as IJavaScriptExecutor;

                return scriptExecutor.ExecuteScript(finderScript, strategyFunctionDefinition, use) as IWebElement;
            }

            #endregion
        }
    }
}
