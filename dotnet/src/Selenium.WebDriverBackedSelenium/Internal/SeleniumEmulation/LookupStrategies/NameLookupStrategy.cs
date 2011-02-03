using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using OpenQA.Selenium;
using Selenium.Internal.SeleniumEmulation;
using Selenium.Internal.SeleniumEmulation.FilterFunctions;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on the element name.
    /// </summary>
    internal class NameLookupStrategy : ILookupStrategy
    {
        private Dictionary<string, IFilterFunction> filterFunctions = new Dictionary<string, IFilterFunction>();
        private Regex nameAndValueMatcherRegex = new Regex("^([A-Za-z]+)=(.+)");

        /// <summary>
        /// Initializes a new instance of the <see cref="NameLookupStrategy"/> class.
        /// </summary>
        public NameLookupStrategy()
        {
            this.filterFunctions.Add("value", new ValueFilterFunction());
            this.filterFunctions.Add("name", new NameFilterFunction());
            this.filterFunctions.Add("index", new IndexFilterFunction());
        }

        /// <summary>
        /// Finds an element using the element name.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            string[] parts = use.Split(new char[] { ' ' });

            ReadOnlyCollection<IWebElement> allElements = driver.FindElements(By.Name(parts[0]));
            IList<IWebElement> filteredElements = new List<IWebElement>(allElements);
            
            for (int i = 1; i < parts.Length; i++)
            {
                IFilterFunction filterBy = this.GetFilterFunction(parts[i]);

                if (filterBy == null)
                {
                    throw new SeleniumException(use + " not found. Cannot find filter for: " + parts[i]);
                }

                string filterValue = this.GetFilterValue(parts[i]);
                filteredElements = filterBy.FilterElements(allElements, filterValue);
            }

            if (filteredElements != null && filteredElements.Count > 0)
            {
                return filteredElements[0];
            }

            throw new SeleniumException(use + " not found");
        }

        private string GetFilterValue(string originalFilterValue)
        {
            Match filterValueMatch = this.nameAndValueMatcherRegex.Match(originalFilterValue);
            if (filterValueMatch.Success)
            {
                return filterValueMatch.Groups[2].ToString();
            }

            return originalFilterValue;
        }

        private IFilterFunction GetFilterFunction(string originalFilter)
        {
            string filterName = "value";

            Match filterValueMatch = this.nameAndValueMatcherRegex.Match(originalFilter);
            if (filterValueMatch.Success)
            {
                filterName = filterValueMatch.Groups[1].ToString();
            }

            return this.filterFunctions[filterName];
        }
    }
}
