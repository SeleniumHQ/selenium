using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class SeleniumOptionSelector
    {
        private static Dictionary<string, IOptionSelectStrategy> optionSelectStrategies = new Dictionary<string, IOptionSelectStrategy>();
        private ElementFinder finder;

        public SeleniumOptionSelector(ElementFinder finder)
        {
            this.finder = finder;
            SetUpOptionFindingStrategies();
        }

        public enum Property
        {
            ID,
            Index,
            Text,
            Value,
        }

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

        public List<string> GetOptions(IWebDriver driver, string selectLocator, Property property, bool fetchAll)
        {
            IWebElement element = finder.FindElement(driver, selectLocator);
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

        public void Select(IWebDriver driver, string selectLocator, string optionLocator, bool setSelected, bool onlyOneOption)
        {
            IWebElement select = finder.FindElement(driver, selectLocator);
            ReadOnlyCollection<IWebElement> allOptions = select.FindElements(By.TagName("option"));

            bool isMultiple = IsMultiSelect(select);

            if (onlyOneOption && isMultiple)
            {
                new RemoveAllSelections(finder).Apply(driver, new string[] { selectLocator });
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

        private void SetUpOptionFindingStrategies()
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