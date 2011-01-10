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
using System.Collections.Generic;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Provides a convenience method for manipulating selections of options in an HTML select element.
    /// </summary>
    public class Select
    {
        private readonly IWebElement element;

        /// <summary>
        /// Returns <see langword="true"/> if the parent element supports multiple selections; otherwise, <see langword="false"/>.
        /// </summary>
        public bool Multiple { get; private set; }

        /// <summary>
        /// Create a new instance of a Select object.
        /// </summary>
        /// <param name="element">The element to be wrapped</param>
        public Select(IWebElement element)
        {
            if (element.TagName ==null || element.TagName.ToLower() != "select")
                throw new UnexpectedTagNameException("select", element.TagName);

            this.element = element;

            //let check if it's a multiple
            string attribute = element.GetAttribute("multiple");
            Multiple = attribute != null && attribute.ToLower().Equals("multiple");
        }

        /// <summary>
        /// Fetch the lsit of options for the Check.
        /// </summary>
        /// <returns>List of <see cref="IWebElement"/>.</returns>
        public IList<IWebElement> GetOptions()
        {
            return element.FindElements(By.TagName("option"));
        }

        /// <summary>
        /// Select the option by the text displayed.
        /// </summary>
        /// <param name="text">The text of the option to be selected.</param>
        public void SelectByText(string text)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.Text == text)
                {
                    option.Select();
                    if(!Multiple) return;
                }
            }
        }

        /// <summary>
        /// Select an option by the value.
        /// </summary>
        /// <param name="value">The value of the option to be selected.</param>
        public void SelectByValue(string value)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.Value == value)
                {
                    option.Select();
                    if (!Multiple) return;
                }
            }
        }

        /// <summary>
        /// Select the option by the index.
        /// </summary>
        /// <param name="index">The index of the option to be selected.</param>
        public void SelectByIndex(int index)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.GetAttribute("index").Equals(index.ToString()))
                {
                    option.Select();
                    if (!Multiple) return;
                }
            }
        }

        /// <summary>
        /// Deselect the option by the text displayed.
        /// </summary>
        /// <param name="text">The text of the option to be deselected.</param>
        public void DeselectByText(string text)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.Text.Equals(text))
                {
                    if (option.Selected) option.Toggle();
                    if (!Multiple) return;
                }
            }
        }

        /// <summary>
        /// Deselect the option by the value.
        /// </summary>
        /// <param name="value">The value of the option to deselect.</param>
        public void DeselectByValue(string value)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.Value.Equals(value))
                {
                    if (option.Selected) option.Toggle();
                    if (!Multiple) return;
                }
            }
        }
        
        /// <summary>
        /// Deselect the option by the index.
        /// </summary>
        /// <param name="index">The index of the option to deselect.</param>
        public void DeselectByIndex(int index)
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.GetAttribute("index").Equals(index.ToString()))
                {
                    if (option.Selected) option.Toggle();
                    if (!Multiple) return;
                }
            }
        }

        /// <summary>
        /// Clear all selected entries. This is only valid when the SELECT supports multiple selections.
        /// </summary>
        public void DeselectAll()
        {
            if (!Multiple)
            {
                throw new WebDriverException("You may only deselect all options if multiselect is supported");
            }

            foreach (IWebElement webElement in GetOptions())
            {
                if (webElement.Selected)
                {
                    webElement.Toggle();
                }
            }
        }

        /// <summary>
        /// Get the selected item.
        /// </summary>
        /// <returns>The <see cref="IWebElement"/> that is selected.</returns>
        /// <remarks>If more than one item is selected this will return the first item.</remarks>
        public IWebElement GetSelected()
        {
            foreach (IWebElement option in GetOptions())
            {
                if (option.Selected) return option;
            }

            throw new NoSuchElementException("No options are selected");
        }

        /// <summary>
        /// Get the all the selected options within the select element.
        /// </summary>
        /// <returns>A list of <see cref="IWebElement"/>.</returns>
        public IList<IWebElement> GetAllSelectedOption()
        {
            List<IWebElement> returnValue = new List<IWebElement>();
            foreach (IWebElement option in GetOptions())
            {
                if (option.Selected) returnValue.Add(option);
            }

            return returnValue;
        }

    }
}
