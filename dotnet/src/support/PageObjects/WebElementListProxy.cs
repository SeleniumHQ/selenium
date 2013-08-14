// <copyright file="WebElementListProxy.cs" company="WebDriver Committers">
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
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Represents a proxy class for a list of elements to be used with the PageFactory.
    /// </summary>
    internal class WebElementListProxy : IList<IWebElement>
    {
        private readonly ISearchContext searchContext;
        private readonly IEnumerable<By> bys;
        private readonly bool cache;
        private List<IWebElement> collection = null;

        /// <summary>
        /// Prevents a default instance of the <see cref="WebElementListProxy"/> class.
        /// </summary>
        private WebElementListProxy()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebElementListProxy"/> class.
        /// </summary>
        /// <param name="searchContext">The driver used to search for elements.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
        internal WebElementListProxy(ISearchContext searchContext, IEnumerable<By> bys, bool cache)
        {
            this.searchContext = searchContext;
            this.bys = bys;
            this.cache = cache;
        }

        /// <summary>
        /// Gets the number of elements contained in the <see cref="WebElementListProxy"/> instance.
        /// </summary>
        public int Count
        {
            get { return this.ElementList.Count; }
        }

        /// <summary>
        /// Gets a value indicating whether this list is read only.
        /// </summary>
        public bool IsReadOnly
        {
            get { return true; }
        }

        /// <summary>
        /// Gets or sets the element at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index of the element to get or set.</param>
        /// <returns>The <see cref="IWebElement"/> at the specified index.</returns>
        public IWebElement this[int index]
        {
            get
            {
                return this.ElementList[index];
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        private List<IWebElement> ElementList
        {
            get
            {
                if (!this.cache || this.collection == null)
                {
                    this.collection = new List<IWebElement>();
                    foreach (var by in this.bys)
                    {
                        ReadOnlyCollection<IWebElement> list = this.searchContext.FindElements(by);
                        this.collection.AddRange(list);
                    }
                }

                return this.collection;
            }
        }

        /// <summary>
        /// Determines whether an element is in the <see cref="WebElementListProxy"/>.
        /// </summary>
        /// <param name="item">The object to locate in the <see cref="WebElementListProxy"/>. The value can be <see langword="null"/>.</param>
        /// <returns><see langword="true"/> if the specified item is in the list; otherwise, <see langword="false"/>.</returns>
        public bool Contains(IWebElement item)
        {
            return this.ElementList.Contains(item);
        }

        /// <summary>
        /// Copies the elements of the <see cref="IWebElement"/> to an Array, starting at a particular Array index.
        /// </summary>
        /// <param name="array">The one-dimensional Array that is the destination of the elements copied from <see cref="IWebElement"/>.
        /// The Array must have zero-based indexing.</param>
        /// <param name="arrayIndex">The zero-based index in array at which copying begins.</param>
        public void CopyTo(IWebElement[] array, int arrayIndex)
        {
            this.ElementList.CopyTo(array, arrayIndex);
        }

        /// <summary>
        /// Determines the index of a specific item in the <see cref="WebElementListProxy"/>.
        /// </summary>
        /// <param name="item">The object to locate in the <see cref="WebElementListProxy"/>.</param>
        /// <returns>The index of <paramref name="item"/> if found in the list; otherwise, -1.</returns>
        public int IndexOf(IWebElement item)
        {
            return this.ElementList.IndexOf(item);
        }

        /// <summary>
        /// Adds an item to the <see cref="WebElementListProxy"/>.
        /// </summary>
        /// <param name="item">The <see cref="IWebElement"/> to add.</param>
        public void Add(IWebElement item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Removes all items from the <see cref="WebElementListProxy"/>.
        /// </summary>
        public void Clear()
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Inserts an item to the <see cref="WebElementListProxy"/> at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index at which item should be inserted.</param>
        /// <param name="item">The object to insert into the <see cref="WebElementListProxy"/> .</param>
        public void Insert(int index, IWebElement item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Removes the <see cref="WebElementListProxy"/> item at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index of the item to remove.</param>
        public void RemoveAt(int index)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Removes the first occurrence of a specific object from the <see cref="WebElementListProxy"/>.
        /// </summary>
        /// <param name="item">The object to remove from the <see cref="WebElementListProxy"/>.</param>
        /// <returns><see langword="true"/> if item was successfully removed from the <see cref="WebElementListProxy"/>;
        /// otherwise, <see langword="false"/>. This method also returns <see langword="false"/> if item is not found 
        /// in the original <see cref="WebElementListProxy"/>.</returns>
        public bool Remove(IWebElement item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Returns an enumerator that iterates through the collection.
        /// </summary>
        /// <returns>A <see cref="IEnumerator"/> that can be used to iterate through the collection.</returns>
        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.ElementList.GetEnumerator();
        }

        /// <summary>
        /// Returns an enumerator that iterates through the collection.
        /// </summary>
        /// <returns>A IEnumerator{IWebElement} that can be used to iterate through the collection.</returns>
        public IEnumerator<IWebElement> GetEnumerator()
        {
            return this.ElementList.GetEnumerator();
        }
    }
}
