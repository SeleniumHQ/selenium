using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    internal abstract class BaseFilterFunction : IFilterFunction
    {

        #region IFilterFunction Members

        public List<IWebElement> FilterElements(IList<IWebElement> allElements, string filterValue)
        {
            List<IWebElement> toReturn = new List<IWebElement>();
            foreach (IWebElement element in allElements)
            {
                if (ShouldAdd(element, filterValue))
                {
                    toReturn.Add(element);
                }
            }

            return toReturn;
        }

        #endregion

        protected abstract bool ShouldAdd(IWebElement element, string filterValue);
    }
}
