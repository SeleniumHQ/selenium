using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    internal class IndexFilterFunction : IFilterFunction
    {
        #region IFilterFunction Members

        public List<IWebElement> FilterElements(IList<IWebElement> allElements, string filterValue)
        {
            int index = -1;
            if (int.TryParse(filterValue, out index))
            {
                if (index < allElements.Count)
                {
                    return new List<IWebElement>() { allElements[index] };
                }
            }

            throw new SeleniumException("Element with index " + filterValue + " not found");
        }

        #endregion
    }
}
