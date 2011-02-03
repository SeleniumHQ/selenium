using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for selecting options.
    /// </summary>
    internal class SeleniumOptionSelector
    {
        private static Dictionary<string, IOptionSelectStrategy> optionSelectStrategies = new Dictionary<string, IOptionSelectStrategy>();
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="SeleniumOptionSelector"/> class.
        /// </summary>
        /// <param name="finder">An <see cref="ElementFinder"/> used in finding the options.</param>
        public SeleniumOptionSelector(ElementFinder finder)
        {
            this.finder = finder;
            SetUpOptionFindingStrategies();
        }

        /// <summary>
        /// Describes the property to use in finding the options within the select element.
        /// </summary>
        public enum Property
        {
            /// <summary>
            /// Find the option by its ID.
            /// </summary>
            ID,

            /// <summary>
            /// Find the option by its index.
            /// </summary>
            Index,
            
            /// <summary>
            /// Find the option by its text.
            /// </summary>
            Text,
            
            /// <summary>
            /// Find the option by its value.
            /// </summary>
            Value,
        }

        /// <summary>
        /// Gets a value indicating whether a select element allows multiple selections.
        /// </summary>
        /// <param name="theSelect">The <see cref="IWebElement"/> to check.</param>
        /// <returns><see langword="true"/> if the select element supports multiple selections; otherwise, <see langword="false"/>.</returns>
        public static bool IsMultiSelect(IWebElement theSelect)
        {
            string multiple = theSelect.GetAttribute("multiple");

            if (string.IsNullOrEmpty(multiple))
            {
                return false;
            }

            if (multiple == "false")
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Gets the list of options.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> used to find the options.</param>
        /// <param name="selectLocator">A locator used by find the containing select element.</param>
        /// <param name="property">A <see cref="Property"/> detemining how to find the options.</param>
        /// <param name="fetchAll"><see langword="true"/> to find all options; otherwise <see langword="false"/>.</param>
        /// <returns>A list of strings describing the options.</returns>
        public List<string> GetOptions(IWebDriver driver, string selectLocator, Property property, bool fetchAll)
        {
            IWebElement element = this.finder.FindElement(driver, selectLocator);
            ReadOnlyCollection<IWebElement> options = element.FindElements(By.TagName("option"));

            if (options.Count == 0)
            {
                throw new SeleniumException("Specified element is not a Select (has no options)");
            }

            List<string> selectedOptions = new List<string>();

            foreach (IWebElement option in options)
            {
                if (fetchAll || option.Selected)
                {
                    switch (property)
                    {
                        case Property.Text:
                            selectedOptions.Add(option.Text);
                            break;

                        case Property.Value:
                            selectedOptions.Add(option.Value);
                            break;

                        case Property.ID:
                            selectedOptions.Add(option.GetAttribute("id"));
                            break;

                        case Property.Index:
                            // TODO(simon): Implement this in the IE driver as "getAttribute"
                            object result = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].index", option);
                            selectedOptions.Add(result.ToString());
                            break;
                    }
                }
            }

            return selectedOptions;
        }

        /// <summary>
        /// Selects the specified options.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> used to find the options.</param>
        /// <param name="selectLocator">A locator used by find the containing select element.</param>
        /// <param name="optionLocator">A locator used to find the options to select in the select element.</param>
        /// <param name="setSelected"><see langword="true"/> to select the options; <see langword="false"/> to unselect.</param>
        /// <param name="onlyOneOption"><see langword="true"/> to select only the first option found; <see langword="false"/> to select all options.</param>
        public void Select(IWebDriver driver, string selectLocator, string optionLocator, bool setSelected, bool onlyOneOption)
        {
            IWebElement select = this.finder.FindElement(driver, selectLocator);
            ReadOnlyCollection<IWebElement> allOptions = select.FindElements(By.TagName("option"));

            bool isMultiple = IsMultiSelect(select);

            if (onlyOneOption && isMultiple)
            {
                new RemoveAllSelections(this.finder).Apply(driver, new string[] { selectLocator });
            }

            Regex matcher = ElementFinder.StrategyPattern;
            string strategyName = "implicit";
            string use = optionLocator;

            if (matcher.IsMatch(optionLocator))
            {
                Match matches = matcher.Match(optionLocator);
                strategyName = matches.Groups[1].Value;
                use = matches.Groups[2].Value;
            }

            if (use == null)
            {
                use = string.Empty;
            }

            IOptionSelectStrategy strategy = null;
            bool strategyExists = optionSelectStrategies.TryGetValue(strategyName, out strategy);
            if (!strategyExists)
            {
                throw new SeleniumException(
                    strategyName + " (from " + optionLocator + ") is not a method for selecting options");
            }

            if (!strategy.SelectOption(allOptions, use, setSelected, isMultiple))
            {
                throw new SeleniumException(optionLocator + " is not an option");
            }
        }

        private static void SetUpOptionFindingStrategies()
        {
            if (optionSelectStrategies.Count == 0)
            {
                optionSelectStrategies.Add("implicit", new LabelOptionSelectStrategy());
                optionSelectStrategies.Add("id", new IdOptionSelectStrategy());
                optionSelectStrategies.Add("index", new IndexOptionSelectStrategy());
                optionSelectStrategies.Add("label", new LabelOptionSelectStrategy());
                optionSelectStrategies.Add("value", new ValueOptionSelectStrategy());
            }
        }
    }
}