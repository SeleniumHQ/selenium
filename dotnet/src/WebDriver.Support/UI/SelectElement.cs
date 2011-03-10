/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Provides a convenience method for manipulating selections of options in an HTML select element.
    /// </summary>
    public class SelectElement
    {
        private readonly IWebElement element;

        /// <summary>
        /// Initializes a new instance of the SelectElement class.
        /// </summary>
        /// <param name="element">The element to be wrapped</param>
        public SelectElement(IWebElement element)
        {
            if (string.IsNullOrEmpty(element.TagName) || string.Compare(element.TagName, "select", StringComparison.OrdinalIgnoreCase) != 0)
            {
                throw new UnexpectedTagNameException("select", element.TagName);
            }

            this.element = element;

            // let check if it's a multiple
            string attribute = element.GetAttribute("multiple");
            this.IsMultiple = !string.IsNullOrEmpty(attribute) && string.Compare(attribute, "multiple", StringComparison.OrdinalIgnoreCase) == 0;
        }

        /// <summary>
        /// Gets a value indicating whether the parent element supports multiple selections.
        /// </summary>
        public bool IsMultiple { get; private set; }

        /// <summary>
        /// Gets the list of options for the select element.
        /// </summary>
        public IList<IWebElement> Options
        {
            get
            {
                return this.element.FindElements(By.TagName("option"));
            }
        }

        /// <summary>
        /// Gets the selected item within the select element. Returns <see langword="null"/> if no option is selected.
        /// </summary>
        /// <remarks>If more than one item is selected this will return the first item.</remarks>
        public IWebElement SelectedOption
        {
            get
            {
                foreach (IWebElement option in this.Options)
                {
                    if (option.Selected)
                    {
                        return option;
                    }
                }

                return null;
            }
        }

        /// <summary>
        /// Gets all of the selected options within the select element.
        /// </summary>
        public IList<IWebElement> AllSelectedOptions
        {
            get
            {
                List<IWebElement> returnValue = new List<IWebElement>();
                foreach (IWebElement option in this.Options)
                {
                    if (option.Selected)
                    {
                        returnValue.Add(option);
                    }
                }

                return returnValue;
            }
        }

        /// <summary>
        /// Select the option by the text displayed.
        /// </summary>
        /// <param name="text">The text of the option to be selected.</param>
        public void SelectByText(string text)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.Text == text)
                {
                    option.Select();
                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Select an option by the value.
        /// </summary>
        /// <param name="value">The value of the option to be selected.</param>
        public void SelectByValue(string value)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.Value == value)
                {
                    option.Select();
                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Select the option by the index.
        /// </summary>
        /// <param name="index">The index of the option to be selected.</param>
        public void SelectByIndex(int index)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.GetAttribute("index").Equals(index.ToString(CultureInfo.InvariantCulture)))
                {
                    option.Select();
                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Deselect the option by the text displayed.
        /// </summary>
        /// <param name="text">The text of the option to be deselected.</param>
        public void DeselectByText(string text)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.Text.Equals(text))
                {
                    if (option.Selected)
                    {
                        option.Toggle();
                    }

                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Deselect the option by the value.
        /// </summary>
        /// <param name="value">The value of the option to deselect.</param>
        public void DeselectByValue(string value)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.Value.Equals(value))
                {
                    if (option.Selected)
                    {
                        option.Toggle();
                    }

                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }
        
        /// <summary>
        /// Deselect the option by the index.
        /// </summary>
        /// <param name="index">The index of the option to deselect.</param>
        public void DeselectByIndex(int index)
        {
            foreach (IWebElement option in this.Options)
            {
                if (option.GetAttribute("index").Equals(index.ToString(CultureInfo.InvariantCulture)))
                {
                    if (option.Selected)
                    {
                        option.Toggle();
                    }

                    if (!this.IsMultiple)
                    {
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Clear all selected entries. This is only valid when the SELECT supports multiple selections.
        /// </summary>
        public void DeselectAll()
        {
            if (!this.IsMultiple)
            {
                throw new WebDriverException("You may only deselect all options if multiselect is supported");
            }

            foreach (IWebElement webElement in this.Options)
            {
                if (webElement.Selected)
                {
                    webElement.Toggle();
                }
            }
        }
    }
}
