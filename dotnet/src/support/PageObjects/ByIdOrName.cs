// <copyright file="ByIdOrName.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Finds element when the id or the name attribute has the specified value.
    /// </summary>
    public class ByIdOrName : By
    {
        private string elementIdentifier = string.Empty;
        private By idFinder;
        private By nameFinder;

        /// <summary>
        /// Initializes a new instance of the <see cref="ByIdOrName"/> class.
        /// </summary>
        /// <param name="elementIdentifier">The ID or Name to use in finding the element.</param>
        public ByIdOrName(string elementIdentifier)
        {
            if (string.IsNullOrEmpty(elementIdentifier))
            {
                throw new ArgumentException("element identifier cannot be null or the empty string", "elementIdentifier");
            }

            this.elementIdentifier = elementIdentifier;
            this.idFinder = By.Id(this.elementIdentifier);
            this.nameFinder = By.Name(this.elementIdentifier);
        }

        /// <summary>
        /// Find a single element.
        /// </summary>
        /// <param name="context">Context used to find the element.</param>
        /// <returns>The element that matches</returns>
        public override IWebElement FindElement(ISearchContext context)
        {
            try
            {
                return this.idFinder.FindElement(context);
            }
            catch (NoSuchElementException)
            {
                return this.nameFinder.FindElement(context);
            }
        }

        /// <summary>
        /// Finds many elements
        /// </summary>
        /// <param name="context">Context used to find the element.</param>
        /// <returns>A readonly collection of elements that match.</returns>
        public override ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            List<IWebElement> elements = new List<IWebElement>();
            elements.AddRange(this.idFinder.FindElements(context));
            elements.AddRange(this.nameFinder.FindElements(context));

            return elements.AsReadOnly();
        }

        /// <summary>
        /// Writes out a description of this By object.
        /// </summary>
        /// <returns>Converts the value of this instance to a <see cref="string"/></returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "ByIdOrName([{0}])", this.elementIdentifier);
        }
    }
}
