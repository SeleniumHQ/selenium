using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    /// <summary>
    /// Defines a function for filtering element lists by index.
    /// </summary>
    internal class IndexFilterFunction : IFilterFunction
    {
        #region IFilterFunction Members
        /// <summary>
        /// Filters a list of elements by the specified value.
        /// </summary>
        /// <param name="allElements">A list of <see cref="IWebElement"/> objects to be filtered.</param>
        /// <param name="filterValue">The value to filter on.</param>
        /// <returns>The filtered list of <see cref="IWebElement"/> objects.</returns>
        public IList<IWebElement> FilterElements(IList<IWebElement> allElements, string filterValue)
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
