using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Collections.ObjectModel;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class SeleniumSelect
    {
        private string findOption;
        private IWebDriver driver;
        private IWebElement select;

        public SeleniumSelect(ElementFinder finder, IWebDriver driver, string locator)
        {
            this.driver = driver;

            this.findOption = "return (" + JavaScriptLibrary.GetSeleniumScript("findOption.js") + ").apply(null, arguments)";

            this.select = finder.FindElement(driver, locator);
            if (this.select.TagName.ToLowerInvariant() != "select")
            {
                throw new SeleniumException("Element is not a select element: " + locator);
            }
        }

        private bool IsMultiple
        {
            get
            {
                string multipleValue = this.select.GetAttribute("multiple");
                bool multiple = multipleValue == "true" || multipleValue == "multiple";
                return multiple;
            }
        }

        public ReadOnlyCollection<IWebElement> AllOptions
        {
            get
            {
                return this.select.FindElements(By.TagName("option"));
            }
        }

        public ReadOnlyCollection<IWebElement> SelectedOptions
        {
            get
            {
                List<IWebElement> toReturn = new List<IWebElement>();

                foreach (IWebElement option in this.select.FindElements(By.TagName("option")))
                {
                    if (option.Selected)
                    {
                        toReturn.Add(option);
                    }
                }

                return toReturn.AsReadOnly();
            }
        }

        public void SetSelected(string optionLocator)
        {
            if (this.IsMultiple)
            {
                foreach (IWebElement opt in this.select.FindElements(By.TagName("option")))
                {
                    if (opt.Selected)
                    {
                        opt.Toggle();
                    }
                }
            }

            IWebElement option = this.LocateOption(optionLocator);
            if (option != null)
            {
                option.Select();
            }
        }

        public void AddSelection(String optionLocator)
        {
            this.AssertSupportsMultipleSelections();

            IWebElement option = this.LocateOption(optionLocator);
            if (option != null)
            {
                option.Select();
            }
        }

        public void RemoveSelection(String optionLocator)
        {
            this.AssertSupportsMultipleSelections();

            IWebElement option = this.LocateOption(optionLocator);
            if (option != null && option.Selected)
            {
                option.Toggle();
            }
        }

        private IWebElement LocateOption(string optionLocator)
        {
            IWebElement option = null;
            try
            {
                option = ((IJavaScriptExecutor)driver).ExecuteScript(findOption, select, optionLocator) as IWebElement;
            }
            catch (InvalidOperationException)
            {
            }

            return option;
        }

        private void AssertSupportsMultipleSelections()
        {
            if (!IsMultiple)
            {
                throw new SeleniumException("You may only add a selection to a select that supports multiple selections");
            }
        }
    }
}
