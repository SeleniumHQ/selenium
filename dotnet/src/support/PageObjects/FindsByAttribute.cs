// <copyright file="FindsByAttribute.cs" company="WebDriver Committers">
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
using System.ComponentModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks program elements with methods by which to find a corresponding element on the page. Used
    /// in conjunction with the <see cref="PageFactory"/>, it allows you to quickly create Page Objects.
    /// </summary>
    /// <remarks>
    /// <para>
    /// You can use this attribute by specifying the <see cref="How"/> and <see cref="Using"/> properties
    /// to indicate how to find the elements. This attribute can be used to decorate fields and properties
    /// in your Page Object classes. The <see cref="Type"/> of the field or property must be either
    /// <see cref="IWebElement"/> or IList{IWebElement}. Any other type will throw an
    /// <see cref="ArgumentException"/> when <see cref="PageFactory.InitElements(ISearchContext, object)"/> is called.
    /// </para>
    /// <para>
    /// <code>
    /// [FindsBy(How = How.Name, Using = "myElementName")]
    /// public IWebElement foundElement;
    ///
    /// [FindsBy(How = How.TagName, Using = "a")]
    /// public IList{IWebElement} allLinks;
    /// </code>
    /// </para>
    /// <para>
    /// You can also use multiple instances of this attribute to find an element that may meet
    /// one of multiple criteria. When using multiple instances, you can specify the order in
    /// which the criteria is matched by using the <see cref="Priority"/> property.
    /// </para>
    /// <para>
    /// <code>
    /// // Will find the element with the name attribute matching the first of "anElementName"
    /// // or "differentElementName".
    /// [FindsBy(How = How.Name, Using = "anElementName", Priority = 0)]
    /// [FindsBy(How = How.Name, Using = "differentElementName", Priority = 1)]
    /// public IWebElement thisElement;
    /// </code>
    /// </para>
    /// </remarks>
    public sealed class FindsByAttribute : AbstractFindsByAttribute
    {
        private By finder = null;

        /// <summary>
        /// Gets or sets the method used to look up the element
        /// </summary>
        [DefaultValue(How.Id)]
        public How How { get; set; }

        /// <summary>
        /// Gets or sets the value to lookup by (i.e. for How.Name, the actual name to look up)
        /// </summary>
        public string Using { get; set; }

        /// <summary>
        /// Gets or sets a value indicating the <see cref="Type"/> of the custom finder. The custom finder must
        /// descend from the <see cref="By"/> class, and expose a public constructor that takes a <see cref="string"/>
        /// argument.
        /// </summary>
        public Type CustomFinderType { get; set; }

        /// <summary>
        /// Gets an explicit <see cref="By"/> object to find by.
        /// </summary>
        public override By Finder
        {
            get
            {
                if (this.finder == null)
                {
                    this.finder = ByFactory.From(this);
                }

                return this.finder;
            }
        }
    }
}
