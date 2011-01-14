using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    internal class NameFilterFunction : BaseFilterFunction
    {
        protected override bool ShouldAdd(IWebElement element, string filterValue)
        {
            String name = element.GetAttribute("name");
            return filterValue == name;
        }
    }
}
