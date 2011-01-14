using System;
using OpenQA.Selenium;
using System.Collections.Generic;
using Selenium.Internal.SeleniumEmulation;
using Selenium.Internal.SeleniumEmulation.FilterFunctions;
using System.Collections.ObjectModel;
using System.Text.RegularExpressions;

namespace Selenium
{
    internal class NameLookupStrategy : ILookupStrategy
    {
        private Dictionary<string, IFilterFunction> filterFunctions = new Dictionary<string, IFilterFunction>();
        private Regex nameAndValueMatcherRegex = new Regex("^([A-Za-z]+)=(.+)");

        public NameLookupStrategy()
        {
            filterFunctions.Add("value", new ValueFilterFunction());
            filterFunctions.Add("name", new NameFilterFunction());
            filterFunctions.Add("index", new IndexFilterFunction());
        }

        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            string[] parts = use.Split(new char[] { ' ' });

            ReadOnlyCollection<IWebElement> allElements = driver.FindElements(By.Name(parts[0]));
            List<IWebElement> filteredElements = new List<IWebElement>(allElements);
            
            for (int i = 1; i < parts.Length; i++)
            {
                IFilterFunction filterBy = GetFilterFunction(parts[i]);

                if (filterBy == null)
                {
                    throw new SeleniumException(use + " not found. Cannot find filter for: " + parts[i]);
                }

                string filterValue = GetFilterValue(parts[i]);
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
            Match filterValueMatch = nameAndValueMatcherRegex.Match(originalFilterValue);
            if (filterValueMatch.Success)
            {
                return filterValueMatch.Groups[2].ToString();
            }
            return originalFilterValue;
        }

        private IFilterFunction GetFilterFunction(string originalFilter)
        {
            string filterName = "value";

            Match filterValueMatch = nameAndValueMatcherRegex.Match(originalFilter);
            if (filterValueMatch.Success)
            {
                filterName = filterValueMatch.Groups[1].ToString();
            }

            return filterFunctions[filterName];
        }

    }
}
