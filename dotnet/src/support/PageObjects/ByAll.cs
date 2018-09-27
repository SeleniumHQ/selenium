// <copyright file="ByAll.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Mechanism used to locate elements within a document using a series of lookups. This class will
    /// find all DOM elements that matches all of the locators in sequence, e.g.
    /// </summary>
    /// <example>
    /// The following code will find all elements that match by1 and then all elements that also match by2.
    /// <code>
    /// driver.findElements(new ByAll(by1, by2))
    /// </code>
    /// This means that the list of elements returned may not be in document order.
    /// </example>>
    public class ByAll : By
    {
        private readonly By[] bys;

        /// <summary>
        /// Initializes a new instance of the <see cref="ByAll"/> class with one or more <see cref="By"/> objects.
        /// </summary>
        /// <param name="bys">One or more <see cref="By"/> references</param>
        public ByAll(params By[] bys)
        {
            this.bys = bys;
        }

        /// <summary>
        /// Find a single element.
        /// </summary>
        /// <param name="context">Context used to find the element.</param>
        /// <returns>The element that matches</returns>
        public override IWebElement FindElement(ISearchContext context)
        {
            var elements = this.FindElements(context);
            if (elements.Count == 0)
            {
                throw new NoSuchElementException("Cannot locate an element using " + this.ToString());
            }

            return elements[0];
        }

        /// <summary>
        /// Finds many elements
        /// </summary>
        /// <param name="context">Context used to find the element.</param>
        /// <returns>A readonly collection of elements that match.</returns>
        public override ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            if (this.bys.Length == 0)
            {
                return new List<IWebElement>().AsReadOnly();
            }

            IEnumerable<IWebElement> elements = null;
            foreach (By by in this.bys)
            {
                ReadOnlyCollection<IWebElement> foundElements = by.FindElements(context);
                if (foundElements.Count == 0)
                {
                    // Optimization: If at any time a find returns no elements, the
                    // only possible result for find-all is an empty collection.
                    return new List<IWebElement>().AsReadOnly();
                }

                if (elements == null)
                {
                    elements = foundElements;
                }
                else
                {
                    elements = elements.Intersect(by.FindElements(context));
                }
            }

            return elements.ToList().AsReadOnly();
        }

        /// <summary>
        /// Writes out a comma separated list of the <see cref="By"/> objects used in the chain.
        /// </summary>
        /// <returns>Converts the value of this instance to a <see cref="string"/></returns>
        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();
            foreach (By by in this.bys)
            {
                if (stringBuilder.Length > 0)
                {
                    stringBuilder.Append(",");
                }

                stringBuilder.Append(by);
            }

            return string.Format(CultureInfo.InvariantCulture, "By.All([{0}])", stringBuilder.ToString());
        }
    }
}
