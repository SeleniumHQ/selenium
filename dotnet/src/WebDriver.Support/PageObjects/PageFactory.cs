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
using System.Collections.ObjectModel;
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
        /// Initializes the elements in the Page Object with the given type.
        /// </summary>
        /// <typeparam name="T">The <see cref="Type"/> of the Page Object class.</typeparam>
        /// <param name="driver">The <see cref="IWebDriver"/> instance used to populate the page.</param>
        /// <returns>An instance of the Page Object class with the elements initialized.</returns>
        /// <remarks>
        /// The class used in the <typeparamref name="T"/> argument must have a public constructor
        /// that takes a single argument of type <see cref="IWebDriver"/>. This helps to enforce
        /// best practices of the Page Object pattern, and encapsulates the driver into the Page
        /// Object so that it can have no external WebDriver dependencies.
        /// </remarks>
        /// <exception cref="ArgumentException">
        /// thrown if no constructor to the class can be found with a single IWebDriver argument
        /// <para>-or-</para>
        /// if a field or property decorated with the <see cref="FindsByAttribute"/> is not of type
        /// <see cref="IWebElement"/> or IList{IWebElement}.
        /// </exception>
       public static T InitElements<T>(IWebDriver driver)
        {
            T page = default(T);
            Type pageClassType = typeof(T);
            ConstructorInfo ctor = pageClassType.GetConstructor(new Type[] { typeof(IWebDriver) });
            if (ctor == null)
            {
                throw new ArgumentException("No constructor for the specified class containing a single argument of type IWebDriver can be found");
            }

            page = (T)ctor.Invoke(new object[] { driver });
            InitElements(driver, page);
            return page;
        }

        /// <summary>
        /// Initializes the elements in the Page Object.
        /// </summary>
        /// <param name="driver">The driver used to find elements on the page.</param>
        /// <param name="page">The Page Object to be populated with elements.</param>
        /// <exception cref="ArgumentException">
        /// thrown if a field or property decorated with the <see cref="FindsByAttribute"/> is not of type
        /// <see cref="IWebElement"/> or IList{IWebElement}.
        /// </exception>
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
                    
                    object proxyObject = null;
                    IInterceptor interceptor = null;
                    var options = new ProxyGenerationOptions
                        {
                            BaseTypeForInterfaceProxy = typeof(WebElementProxyComparer)
                        };

                    var field = member as FieldInfo;
                    var property = member as PropertyInfo;
                    if (field != null)
                    {
                        if (field.FieldType == typeof(IList<IWebElement>))
                        {
                            interceptor = new ProxiedWebElementCollectionInterceptor(driver, bys, cache);
                            proxyObject = generator.CreateInterfaceProxyWithoutTarget(
                                typeof(IList<IWebElement>),
                                interceptor);
                        }
                        else if (field.FieldType == typeof(IWebElement))
                        {
                            interceptor = new ProxiedWebElementInterceptor(driver, bys, cache);
                            proxyObject = generator.CreateInterfaceProxyWithoutTarget(
                                typeof(IWrapsElement),
                                new[] { field.FieldType, typeof(ILocatable) },
                                options,
                                interceptor);
                        }
                        else
                        {
                            throw new ArgumentException("Type of field '" + field.Name + "' is not IWebElement or IList<IWebElement>");
                        }

                        field.SetValue(page, proxyObject);
                    }
                    else if (property != null)
                    {
                        if (property.PropertyType == typeof(IList<IWebElement>))
                        {
                            interceptor = new ProxiedWebElementCollectionInterceptor(driver, bys, cache);
                            proxyObject = generator.CreateInterfaceProxyWithoutTarget(
                                typeof(IList<IWebElement>),
                                interceptor);
                        }
                        else if (property.PropertyType == typeof(IWebElement))
                        {
                            interceptor = new ProxiedWebElementInterceptor(driver, bys, cache);
                            proxyObject = generator.CreateInterfaceProxyWithoutTarget(
                                typeof(IWrapsElement),
                                new[] { property.PropertyType, typeof(ILocatable) },
                                options,
                                interceptor);
                        }
                        else
                        {
                            throw new ArgumentException("Type of property '" + property.Name + "' is not IWebElement or IList<IWebElement>");
                        }

                        property.SetValue(page, proxyObject, null);
                    }
                }
            }
        }

        /// <summary>
        /// Provides an interceptor to assist in creating the Page Object. This class cannot be inherited.
        /// </summary>
        private sealed class ProxiedWebElementCollectionInterceptor : IInterceptor, IList<IWebElement>
        {
            private readonly ISearchContext searchContext;
            private readonly IEnumerable<By> bys;
            private readonly bool cache;
            private List<IWebElement> collection = null;

            /// <summary>
            /// Initializes a new instance of the <see cref="ProxiedWebElementCollectionInterceptor"/> class.
            /// </summary>
            /// <param name="searchContext">The driver used to search for elements.</param>
            /// <param name="bys">The list of methods by which to search for the elements.</param>
            /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
            public ProxiedWebElementCollectionInterceptor(ISearchContext searchContext, IEnumerable<By> bys, bool cache)
            {
                this.searchContext = searchContext;
                this.bys = bys;
                this.cache = cache;
            }

            public int Count
            {
                get { return this.collection.Count; }
            }

            public bool IsReadOnly
            {
                get { return true; }
            }

            public IWebElement this[int index]
            {
                get
                {
                    return this.collection[index];
                }

                set
                {
                    throw new NotImplementedException();
                }
            }

            public bool Contains(IWebElement item)
            {
                return this.collection.Contains(item);
            }

            public void CopyTo(IWebElement[] array, int arrayIndex)
            {
                this.collection.CopyTo(array, arrayIndex);
            }

            public int IndexOf(IWebElement item)
            {
                return this.collection.IndexOf(item);
            }

            public IEnumerator<IWebElement> GetEnumerator()
            {
                return this.collection.GetEnumerator();
            }

            public void Add(IWebElement item)
            {
                throw new NotImplementedException();
            }

            public void Clear()
            {
                throw new NotImplementedException();
            }

            public void Insert(int index, IWebElement item)
            {
                throw new NotImplementedException();
            }

            public void RemoveAt(int index)
            {
                throw new NotImplementedException();
            }

            public bool Remove(IWebElement item)
            {
                throw new NotImplementedException();
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return this.collection.GetEnumerator();
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

                if (!this.cache || this.collection == null)
                {
                    this.collection = new List<IWebElement>();
                    foreach (var by in this.bys)
                    {
                        ReadOnlyCollection<IWebElement> list = this.searchContext.FindElements(by);
                        this.collection.AddRange(list);
                    }
                }

                invocation.ReturnValue = invocation.GetConcreteMethod().Invoke(this.collection, invocation.Arguments);
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
            /// Initializes a new instance of the <see cref="ProxiedWebElementInterceptor"/> class.
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
            /// Gets the element wrapped by this <see cref="ProxiedWebElementInterceptor"/>.
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
