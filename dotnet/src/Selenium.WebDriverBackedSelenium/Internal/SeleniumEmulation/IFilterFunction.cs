using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Collections.ObjectModel;

namespace Selenium.Internal.SeleniumEmulation
{
    public interface IFilterFunction
    {
        List<IWebElement> FilterElements(IList<IWebElement> allElements, string filterValue);
    }
}
