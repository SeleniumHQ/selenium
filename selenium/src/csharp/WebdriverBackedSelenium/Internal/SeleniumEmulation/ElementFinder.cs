using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Selenium;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public class ElementFinder
    {
        private Dictionary<String, ILookupStrategy> lookupStrategies = new Dictionary<String, ILookupStrategy>();
        public static Regex StrategyPattern = new Regex("^([a-zA-Z]+)=(.*)");

        public ElementFinder()
        {
            SetUpElementFindingStrategies();
        }

        public IWebElement FindElement(IWebDriver driver, string locator)
        {
            IWebElement result;
            ILookupStrategy strategy = FindStrategy(locator);
            string use = DetermineLocator(locator);
            try
            {
                result = strategy.Find(driver, use);
            }
            catch (NoSuchElementException e)
            {
                throw new SeleniumException("Element " + locator + " not found.");
            }

            return result;
        }

        public ILookupStrategy FindStrategy(String locator)
        {
            String strategyName = "implicit";
            Match m = StrategyPattern.Match(locator);

            if (m.Success)
            {
                strategyName = m.Groups[1].Value;
            }

            ILookupStrategy strategy;
            if (!lookupStrategies.TryGetValue(strategyName, out strategy))
            {
                throw new SeleniumException("No matcher found for " + strategyName);
            }

            return strategy;
        }

        public string DetermineLocator(String locator)
        {
            String result = locator;
            Match m = StrategyPattern.Match(locator);

            if (m.Success)
            {
                result = m.Groups[2].Value;
            }

            return result;
        }

        public void AddStrategy(string strategyName, ILookupStrategy strategy)
        {
            lookupStrategies.Add(strategyName, strategy);
        }

        private void SetUpElementFindingStrategies()
        {
            lookupStrategies.Add("alt", new AltLookupStrategy());
            lookupStrategies.Add("class", new ClassLookupStrategy());
            lookupStrategies.Add("id", new IdLookupStrategy());
            lookupStrategies.Add("identifier", new IdentifierLookupStrategy());
            lookupStrategies.Add("implicit", new ImplicitLookupStrategy());
            lookupStrategies.Add("link", new LinkLookupStrategy());
            lookupStrategies.Add("name", new NameLookupStrategy());
            lookupStrategies.Add("xpath", new XPathLookupStrategy());
            lookupStrategies.Add("dom", new DomTraversalLookupStrategy());
        }
    }
}
