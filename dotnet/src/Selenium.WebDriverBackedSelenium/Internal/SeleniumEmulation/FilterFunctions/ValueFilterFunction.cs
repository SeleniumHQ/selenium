using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    internal class ValueFilterFunction : BaseFilterFunction
    {
        protected override bool ShouldAdd(IWebElement element, string filterValue)
        {
            string elementValue = element.Value;
            return filterValue == elementValue;
        }
    }
}
