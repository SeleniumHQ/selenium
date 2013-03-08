// <copyright file="WebElementProxy.cs" company="WebDriver Committers">
// Copyright 2007-2013 WebDriver committers
// Portions copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Drawing;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Represents a proxy class for an element to be used with the PageFactory.
    /// </summary>
    internal class WebElementProxy : IWebElement, ILocatable, IWrapsElement
    {
        private readonly ISearchContext searchContext;
        private readonly IEnumerable<By> bys;
        private readonly bool cache;
        private IWebElement cachedElement;

        /// <summary>
        /// Prevents a default instance of the <see cref="WebElementProxy"/> class.
        /// </summary>
        private WebElementProxy()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebElementProxy"/> class.
        /// </summary>
        /// <param name="searchContext">The driver used to search for elements.</param>
        /// <param name="bys">The list of methods by which to search for the element.</param>
        /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
        internal WebElementProxy(ISearchContext searchContext, IEnumerable<By> bys, bool cache)
        {
            this.searchContext = searchContext;
            this.bys = bys;
            this.cache = cache;
        }

        /// <summary>
        /// Gets the tag name of this element.
        /// </summary>
        public string TagName
        {
            get { return this.WrappedElement.TagName; }
        }

        /// <summary>
        /// Gets the innerText of this element, without any leading or trailing whitespace,
        /// and with other whitespace collapsed.
        /// </summary>
        public string Text
        {
            get { return this.WrappedElement.Text; }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is enabled.
        /// </summary>
        public bool Enabled
        {
            get { return this.WrappedElement.Enabled; }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is selected.
        /// </summary>
        public bool Selected
        {
            get { return this.WrappedElement.Selected; }
        }

        /// <summary>
        /// Gets a <see cref="Point"/> object containing the coordinates of the upper-left corner
        /// of this element relative to the upper-left corner of the page.
        /// </summary>
        public Point Location
        {
            get { return this.WrappedElement.Location; }
        }

        /// <summary>
        /// Gets a <see cref="Size"/> object containing the height and width of this element.
        /// </summary>
        public Size Size
        {
            get { return this.WrappedElement.Size; }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is displayed.
        /// </summary>
        public bool Displayed
        {
            get { return this.WrappedElement.Displayed; }
        }

        /// <summary>
        /// Gets the location of an element on the screen, scrolling it into view
        /// if it is not currently on the screen.
        /// </summary>
        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                ILocatable locatable = this.WrappedElement as ILocatable;
                return locatable.LocationOnScreenOnceScrolledIntoView;
            }
        }

        /// <summary>
        /// Gets the coordinates identifying the location of this element using
        /// various frames of reference.
        /// </summary>
        public ICoordinates Coordinates
        {
            get
            {
                ILocatable locatable = this.WrappedElement as ILocatable;
                return locatable.Coordinates;
            }
        }

        /// <summary>
        /// Defines the interface through which the user can discover if there is an underlying element to be used.
        /// </summary>
        public IWebElement WrappedElement
        {
            get
            {
                if (this.cache && this.cachedElement != null)
                {
                    return this.cachedElement;
                }

                string errorString = null;
                foreach (var by in this.bys)
                {
                    try
                    {
                        this.cachedElement = this.searchContext.FindElement(by);
                        return this.cachedElement;
                    }
                    catch (NoSuchElementException)
                    {
                        errorString = (errorString == null ? "Could not find element by: " : errorString + ", or: ") + by;
                    }
                }

                throw new NoSuchElementException(errorString);
            }
        }

        /// <summary>
        /// Clears the content of this element.
        /// </summary>
        public void Clear()
        {
            this.WrappedElement.Clear();
        }

        /// <summary>
        /// Simulates typing text into the element.
        /// </summary>
        public void SendKeys(string text)
        {
            this.WrappedElement.SendKeys(text);
        }

        /// <summary>
        /// Submits this element to the web server.
        /// </summary>
        public void Submit()
        {
            this.WrappedElement.Submit();
        }

        /// <summary>
        /// Clicks this element. 
        /// </summary>
        public void Click()
        {
            this.WrappedElement.Click();
        }

        /// <summary>
        /// Gets the value of the specified attribute for this element.
        /// </summary>
        public string GetAttribute(string attributeName)
        {
            return this.WrappedElement.GetAttribute(attributeName);
        }

        /// <summary>
        /// Gets the value of a CSS property of this element.
        /// </summary>
        public string GetCssValue(string propertyName)
        {
            return this.WrappedElement.GetCssValue(propertyName);
        }

        /// <summary>
        /// Finds the first <see cref="IWebElement"/> using the given method. 
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        public IWebElement FindElement(By by)
        {
            return this.WrappedElement.FindElement(by);
        }

        /// <summary>
        /// Finds all <see cref="IWebElement">IWebElements</see> within the current context 
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return this.WrappedElement.FindElements(by);
        }

        /// <summary>
        /// Determines whether the specified object is equal to the current object.
        /// </summary>
        /// <param name="obj">The object to compare with the current object. </param>
        /// <returns><see langword="true"/> if the specified object is equal to the current object; otherwise, <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            return this.WrappedElement.Equals(obj);
        }

        /// <summary>
        /// Serves as a hash function for a particular type.
        /// </summary>
        /// <returns>A hash code for the current object.</returns>
        public override int GetHashCode()
        {
            return this.WrappedElement.GetHashCode();
        }
    }
}
