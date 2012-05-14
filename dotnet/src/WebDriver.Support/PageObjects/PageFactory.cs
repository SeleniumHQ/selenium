// <copyright file="PageFactory.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
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
using System.Reflection;
using Castle.DynamicProxy;
using OpenQA.Selenium.Interactions.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides the ability to produce Page Objects modeling a page. This class cannot be inherited.
    /// </summary>
    public sealed class PageFactory
    {
        private static ProxyGenerator generator = new ProxyGenerator();

        /// <summary>
        /// Prevents a default instance of the PageFactory class from being created.
        /// </summary>
        private PageFactory()
        {
        }

        /// <summary>
        /// Initializes the elements in the Page Object.
        /// </summary>
        /// <param name="driver">The driver used to find elements on the page.</param>
        /// <param name="page">The Page Object to be populated with elements.</param>
        public static void InitElements(ISearchContext driver, object page)
        {
            if (page == null)
            {
                throw new ArgumentNullException("page", "page cannot be null");
            }

            var type = page.GetType();
            var members = new List<MemberInfo>();
            const BindingFlags PublicBindingOptions = BindingFlags.Instance | BindingFlags.Public;
            members.AddRange(type.GetFields(PublicBindingOptions));
            members.AddRange(type.GetProperties(PublicBindingOptions));
            while (type != null)
            {
                const BindingFlags NonPublicBindingOptions = BindingFlags.Instance | BindingFlags.NonPublic;
                members.AddRange(type.GetFields(NonPublicBindingOptions));
                members.AddRange(type.GetProperties(NonPublicBindingOptions));
                type = type.BaseType;
            }

            foreach (var member in members)
            {
                List<By> bys = new List<By>();
                bool cache = false;
                var attributes = Attribute.GetCustomAttributes(member, typeof(FindsByAttribute), true);
                if (attributes.Length > 0)
                {
                    Array.Sort(attributes);
                    foreach (var attribute in attributes)
                    {
                        var castedAttribute = (FindsByAttribute)attribute;
                        if (castedAttribute.Using == null)
                        {
                            castedAttribute.Using = member.Name;
                        }

                        bys.Add(castedAttribute.Finder);
                    }

                    var cacheAttributeType = typeof(CacheLookupAttribute);
                    cache = member.GetCustomAttributes(cacheAttributeType, true).Length != 0 || member.DeclaringType.GetCustomAttributes(cacheAttributeType, true).Length != 0;

                    var interceptor = new ProxiedWebElementInterceptor(driver, bys, cache);

                    var options = new ProxyGenerationOptions
                        {
                            BaseTypeForInterfaceProxy = typeof(WebElementProxyComparer)
                        };

                    var field = member as FieldInfo;
                    var property = member as PropertyInfo;
                    if (field != null)
                    {
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(
                            typeof(IWrapsElement),
                            new[] { field.FieldType, typeof(ILocatable) },
                            options,
                            interceptor);

                        field.SetValue(page, proxyElement);
                    }
                    else if (property != null)
                    {
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(
                            typeof(IWrapsElement),
                            new[] { property.PropertyType, typeof(ILocatable) },
                            options,
                            interceptor);

                        property.SetValue(page, proxyElement, null);
                    }
                }
            }
        }

        /// <summary>
        /// Provides an interceptor to assist in creating the Page Object. This class cannot be inherited.
        /// </summary>
        private sealed class ProxiedWebElementInterceptor : IInterceptor, IWrapsElement
        {
            private readonly ISearchContext searchContext;
            private readonly IEnumerable<By> bys;
            private readonly bool cache;
            private IWebElement cachedElement;

            /// <summary>
            /// Initializes a new instance of the ProxiedWebElementInterceptor class.
            /// </summary>
            /// <param name="searchContext">The driver used to search for element.</param>
            /// <param name="bys">The list of methods by which to search for the elements.</param>
            /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
            public ProxiedWebElementInterceptor(ISearchContext searchContext, IEnumerable<By> bys, bool cache)
            {
                this.searchContext = searchContext;
                this.bys = bys;
                this.cache = cache;
            }

            /// <summary>
            /// Gets the element wrapped by this ProxiedWebElementInterceptor.
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
            /// Intercepts calls to methods on the class.
            /// </summary>
            /// <param name="invocation">An IInvocation object describing the actual implementation.</param>
            public void Intercept(IInvocation invocation)
            {
                if (invocation == null)
                {
                    throw new ArgumentNullException("invocation", "invocation cannot be null");
                }

                if (invocation.Method.Name == "get_WrappedElement")
                {
                    invocation.ReturnValue = this.WrappedElement;
                }
                else if (invocation.Method.Name == "get_LocationOnScreenOnceScrolledIntoView" || invocation.Method.Name == "get_Coordinates")
                {
                    invocation.ReturnValue = invocation.GetConcreteMethod().Invoke(this.WrappedElement as ILocatable, invocation.Arguments);
                }
                else
                {
                    invocation.ReturnValue = invocation.GetConcreteMethod().Invoke(this.WrappedElement, invocation.Arguments);
                }
            }
        }
    }
}
