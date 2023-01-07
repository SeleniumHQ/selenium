// <copyright file="RelativeBy.cs" company="WebDriver Committers">
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
using System.IO;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for finding elements spatially relative to other elements.
    /// </summary>
    public class RelativeBy : By
    {
        private string wrappedAtom;
        private object root;
        private List<object> filters = new List<object>();

        /// <summary>
        /// Prevents a default instance of the <see cref="RelativeBy"/> class.
        /// </summary>
        protected RelativeBy() : base()
        {
            string atom = string.Empty;
            using (Stream atomStream = ResourceUtilities.GetResourceStream("find-elements.js", "find-elements.js"))
            {
                using (StreamReader atomReader = new StreamReader(atomStream))
                {
                    atom = atomReader.ReadToEnd();
                }
            }

            wrappedAtom = string.Format(CultureInfo.InvariantCulture, "/* findElements */return ({0}).apply(null, arguments);", atom);
        }

        private RelativeBy(object root) : this(root, null)
        {
        }

        private RelativeBy(object root, List<object> filters) : this()
        {
            this.root = this.GetSerializableRoot(root);

            if (filters != null && filters.Count > 0)
            {
                this.filters.AddRange(filters);
            }
        }

        /// <summary>
        /// Creates a new <see cref="RelativeBy"/> for finding elements with the specified tag name.
        /// </summary>
        /// <param name="by">A By object that will be used to find the initial element.</param>
        /// <returns>A <see cref="RelativeBy"/> object to be used in finding the elements.</returns>
        public static RelativeBy WithLocator(By by)
        {
            return new RelativeBy(by);
        }


        /// <summary>
        /// Finds the first element matching the criteria.
        /// </summary>
        /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        public override IWebElement FindElement(ISearchContext context)
        {
            ReadOnlyCollection<IWebElement> elements = FindElements(context);
            if (elements.Count == 0)
            {
                throw new NoSuchElementException("Unable to find element");
            }

            return elements[0];
        }

        /// <summary>
        /// Finds all elements matching the criteria.
        /// </summary>
        /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public override ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            IJavaScriptExecutor js = GetExecutor(context);
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            Dictionary<string, object> filterParameters = new Dictionary<string, object>();
            filterParameters["root"] = this.GetSerializableObject(this.root);
            filterParameters["filters"] = this.filters;
            parameters["relative"] = filterParameters;
            object rawElements = js.ExecuteScript(wrappedAtom, parameters);
            ReadOnlyCollection<IWebElement> elements = rawElements as ReadOnlyCollection<IWebElement>;
            return elements;
        }

        /// <summary>
        /// Locates an element above the specified element.
        /// </summary>
        /// <param name="element">The element to look above for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Above(IWebElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
            }

            return SimpleDirection("above", element);
        }

        /// <summary>
        /// Locates an element above the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look above for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Above(By locator)
        {
            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
            }

            return SimpleDirection("above", locator);
        }

        /// <summary>
        /// Locates an element below the specified element.
        /// </summary>
        /// <param name="element">The element to look below for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Below(IWebElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
            }

            return SimpleDirection("below", element);
        }

        /// <summary>
        /// Locates an element below the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look below for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Below(By locator)
        {
            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
            }

            return SimpleDirection("below", locator);
        }

        /// <summary>
        /// Locates an element to the left of the specified element.
        /// </summary>
        /// <param name="element">The element to look to the left of for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy LeftOf(IWebElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
            }

            return SimpleDirection("left", element);
        }

        /// <summary>
        /// Locates an element to the left of the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look to the left of for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy LeftOf(By locator)
        {
            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
            }

            return SimpleDirection("left", locator);
        }

        /// <summary>
        /// Locates an element to the right of the specified element.
        /// </summary>
        /// <param name="element">The element to look to the right of for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy RightOf(IWebElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
            }

            return SimpleDirection("right", element);
        }

        /// <summary>
        /// Locates an element to the right of the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look to the right of for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy RightOf(By locator)
        {
            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
            }

            return SimpleDirection("right", locator);
        }

        /// <summary>
        /// Locates an element near the specified element.
        /// </summary>
        /// <param name="element">The element to look near for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Near(IWebElement element)
        {
            return Near(element, 50);
        }

        /// <summary>
        /// Locates an element near the specified element.
        /// </summary>
        /// <param name="element">The element to look near for elements.</param>
        /// <param name="atMostDistanceInPixels">The maximum distance from the element to be considered "near."</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Near(IWebElement element, int atMostDistanceInPixels)
        {
            return Near((object)element, atMostDistanceInPixels);
        }

        /// <summary>
        /// Locates an element near the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look near for elements.</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Near(By locator)
        {
            return Near(locator, 50);
        }

        /// <summary>
        /// Locates an element near the specified element.
        /// </summary>
        /// <param name="locator">The locator describing the element to look near for elements.</param>
        /// <param name="atMostDistanceInPixels">The maximum distance from the element to be considered "near."</param>
        /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
        public RelativeBy Near(By locator, int atMostDistanceInPixels)
        {
            return Near((object)locator, atMostDistanceInPixels);
        }

        private RelativeBy Near(object locator, int atMostDistanceInPixels)
        {
            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Locator to use to search must be set");
            }

            if (atMostDistanceInPixels <= 0)
            {
                throw new ArgumentException("Distance must be greater than zero", nameof(atMostDistanceInPixels));
            }

            Dictionary<string, object> filter = new Dictionary<string, object>();
            filter["kind"] = "near";
            filter["args"] = new List<object>() { GetSerializableObject(locator), "distance", atMostDistanceInPixels };
            this.filters.Add(filter);

            return new RelativeBy(this.root, this.filters);
        }

        private RelativeBy SimpleDirection(string direction, object locator)
        {
            if (string.IsNullOrEmpty(direction))
            {
                throw new ArgumentNullException(nameof(direction), "Direction cannot be null or the empty string");
            }

            if (locator == null)
            {
                throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
            }

            Dictionary<string, object> filter = new Dictionary<string, object>();
            filter["kind"] = direction;
            filter["args"] = new List<object>() { GetSerializableObject(locator) };
            this.filters.Add(filter);

            return new RelativeBy(this.root, this.filters);
        }

        private object GetSerializableRoot(object toSerialize)
        {
            if (toSerialize == null)
            {
                throw new ArgumentNullException(nameof(toSerialize), "object to serialize must not be null");
            }

            By asBy = toSerialize as By;
            if (asBy != null)
            {
                return asBy;
            }

            IWebElement element = toSerialize as IWebElement;
            if (element != null)
            {
                return element;
            }

            IWrapsElement wrapper = toSerialize as IWrapsElement;
            if (wrapper != null)
            {
                return wrapper.WrappedElement;
            }

            throw new WebDriverException("Serializable locator must be a By, an IWebElement, or a wrapped element using IWrapsElement");
        }

        private object GetSerializableObject(object toSerialize)
        {
            if (toSerialize == null)
            {
                throw new ArgumentNullException(nameof(toSerialize), "object to serialize must not be null");
            }

            By asBy = toSerialize as By;
            if (asBy != null)
            {
                Dictionary<string, object> serializedBy = new Dictionary<string, object>();
                serializedBy[asBy.Mechanism] = asBy.Criteria;
                return serializedBy;
            }

            IWebElement element = toSerialize as IWebElement;
            if (element != null)
            {
                return element;
            }

            IWrapsElement wrapper = toSerialize as IWrapsElement;
            if (wrapper != null)
            {
                return wrapper.WrappedElement;
            }

            throw new WebDriverException("Serializable locator must be a By, an IWebElement, or a wrapped element using IWrapsElement");
        }

        private IJavaScriptExecutor GetExecutor(ISearchContext context)
        {
            IJavaScriptExecutor executor = context as IJavaScriptExecutor;
            if (executor != null)
            {
                return executor;
            }

            IWrapsDriver current = context as IWrapsDriver;
            while (current != null)
            {
                IWebDriver driver = current.WrappedDriver;
                executor = driver as IJavaScriptExecutor;
                if (executor != null)
                {
                    break;
                }

                current = driver as IWrapsDriver;
            }

            if (executor == null)
            {
                throw new ArgumentException("Search context must support JavaScript or IWrapsDriver where the wrappted driver supports JavaScript", nameof(context));
            }

            return executor;
        }
    }
}
