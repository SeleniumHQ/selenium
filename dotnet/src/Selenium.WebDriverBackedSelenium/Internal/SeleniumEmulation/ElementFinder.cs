using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for finding elements.
    /// </summary>
    internal class ElementFinder
    {
        /// <summary>
        /// A <see cref="Regex"/> used to match element lookup patterns.
        /// </summary>
        public static readonly Regex StrategyPattern = new Regex("^([a-zA-Z]+)=(.*)");

        private Dictionary<string, ILookupStrategy> lookupStrategies = new Dictionary<string, ILookupStrategy>();

        /// <summary>
        /// Initializes a new instance of the <see cref="ElementFinder"/> class.
        /// </summary>
        public ElementFinder()
        {
            this.SetUpElementFindingStrategies();
        }

        /// <summary>
        /// Gets the locator value to use in finding elements.
        /// </summary>
        /// <param name="locator">The locator string.</param>
        /// <returns>The value to use in finding elements.</returns>
        internal static string DetermineLocator(string locator)
        {
            string result = locator;
            Match m = StrategyPattern.Match(locator);

            if (m.Success)
            {
                result = m.Groups[2].Value;
            }

            return result;
        }

        /// <summary>
        /// Finds an element.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the elements.</param>
        /// <param name="locator">The locator string describing how to find the element.</param>
        /// <returns>An <see cref="IWebElement"/> described by the locator.</returns>
        /// <exception cref="SeleniumException">There is no element matching the locator.</exception>
        internal IWebElement FindElement(IWebDriver driver, string locator)
        {
            IWebElement result;
            ILookupStrategy strategy = this.FindStrategy(locator);
            string use = DetermineLocator(locator);
            try
            {
                result = strategy.Find(driver, use);
            }
            catch (NoSuchElementException)
            {
                throw new SeleniumException("Element " + locator + " not found.");
            }

            return result;
        }

        /// <summary>
        /// Gets the strategy used to find elements.
        /// </summary>
        /// <param name="locator">The locator string that defines the strategy.</param>
        /// <returns>An <see cref="ILookupStrategy"/> object used in finding elements.</returns>
        internal ILookupStrategy FindStrategy(string locator)
        {
            string strategyName = "implicit";
            Match m = StrategyPattern.Match(locator);

            if (m.Success)
            {
                strategyName = m.Groups[1].Value;
            }

            ILookupStrategy strategy;
            if (!this.lookupStrategies.TryGetValue(strategyName, out strategy))
            {
                throw new SeleniumException("No matcher found for " + strategyName);
            }

            return strategy;
        }

        /// <summary>
        /// Adds a strategy to the dictionary of known lookup strategies.
        /// </summary>
        /// <param name="strategyName">The name used to identify the lookup strategy.</param>
        /// <param name="strategy">The <see cref="ILookupStrategy"/> used in finding elements.</param>
        internal void AddStrategy(string strategyName, ILookupStrategy strategy)
        {
            this.lookupStrategies.Add(strategyName, strategy);
        }

        private void SetUpElementFindingStrategies()
        {
            this.lookupStrategies.Add("alt", new AltLookupStrategy());
            this.lookupStrategies.Add("class", new ClassLookupStrategy());
            this.lookupStrategies.Add("id", new IdLookupStrategy());
            this.lookupStrategies.Add("identifier", new IdentifierLookupStrategy());
            this.lookupStrategies.Add("implicit", new ImplicitLookupStrategy());
            this.lookupStrategies.Add("link", new LinkLookupStrategy());
            this.lookupStrategies.Add("name", new NameLookupStrategy());
            this.lookupStrategies.Add("xpath", new XPathLookupStrategy());
            this.lookupStrategies.Add("dom", new DomTraversalLookupStrategy());
            this.lookupStrategies.Add("css", new CssSelectorLookupStrategy());
        }
    }
}
