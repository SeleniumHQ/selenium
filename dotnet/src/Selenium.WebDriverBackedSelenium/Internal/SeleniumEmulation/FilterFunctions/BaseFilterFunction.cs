using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    /// <summary>
    /// Defines a function for filtering element lists.
    /// </summary>
    internal abstract class BaseFilterFunction : IFilterFunction
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
            List<IWebElement> toReturn = new List<IWebElement>();
            foreach (IWebElement element in allElements)
            {
                if (this.ShouldAdd(element, filterValue))
                {
                    toReturn.Add(element);
                }
            }

            return toReturn;
        }
        #endregion

        /// <summary>
        /// Gets a value indicating whether an element meets the filter criteria.
        /// </summary>
        /// <param name="element">The candidate <see cref="IWebElement"/> to be evaluated.</param>
        /// <param name="filterValue">The value which defines the filter.</param>
        /// <returns><see langword="true"/> if the element should be added to the filtered list; <see langword="false"/> if not.</returns>
        protected abstract bool ShouldAdd(IWebElement element, string filterValue);
    }
}
