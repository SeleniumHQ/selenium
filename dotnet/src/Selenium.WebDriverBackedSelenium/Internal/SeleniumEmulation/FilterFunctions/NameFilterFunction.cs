using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation.FilterFunctions
{
    /// <summary>
    /// Defines a function for filtering element lists by element name.
    /// </summary>
    internal class NameFilterFunction : BaseFilterFunction
    {
        /// <summary>
        /// Gets a value indicating whether an element meets the filter criteria.
        /// </summary>
        /// <param name="element">The candidate <see cref="IWebElement"/> to be evaluated.</param>
        /// <param name="filterValue">The value which should match the element name.</param>
        /// <returns><see langword="true"/> if the element should be added to the filtered list; <see langword="false"/> if not.</returns>
        protected override bool ShouldAdd(IWebElement element, string filterValue)
        {
            string name = element.GetAttribute("name");
            return filterValue == name;
        }
    }
}
