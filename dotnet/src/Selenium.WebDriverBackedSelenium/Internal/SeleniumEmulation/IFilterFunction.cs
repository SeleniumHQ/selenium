using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Collections.ObjectModel;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides a method by which to filter elements.
    /// </summary>
    public interface IFilterFunction
    {
        /// <summary>
        /// Filters elements by the specified criteria.
        /// </summary>
        /// <param name="allElements">A list of all elements to be filtered.</param>
        /// <param name="filterValue">The filter string containing the criteria on which to filter.</param>
        /// <returns>A list of element, filtered by the criteria.</returns>
        List<IWebElement> FilterElements(IList<IWebElement> allElements, string filterValue);
    }
}
