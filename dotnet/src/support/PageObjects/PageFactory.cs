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
using OpenQA.Selenium.Interactions.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides the ability to produce Page Objects modeling a page. This class cannot be inherited.
    /// </summary>
    public sealed class PageFactory
    {
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
                List<By> bys = CreateLocatorList(member);
                if (bys.Count > 0)
                {
                    bool cache = ShouldCacheLookup(member);
                    
                    object proxyObject = null;
                    var field = member as FieldInfo;
                    var property = member as PropertyInfo;
                    if (field != null)
                    {
                        proxyObject = CreateProxyObject(field.FieldType, driver, bys, cache);
                        if (proxyObject == null)
                        {
                            throw new ArgumentException("Type of field '" + field.Name + "' is not IWebElement or IList<IWebElement>");
                        }

                        field.SetValue(page, proxyObject);
                    }
                    else if (property != null)
                    {
                        proxyObject = CreateProxyObject(property.PropertyType, driver, bys, cache);
                        if (proxyObject == null)
                        {
                            throw new ArgumentException("Type of property '" + property.Name + "' is not IWebElement or IList<IWebElement>");
                        }

                        property.SetValue(page, proxyObject, null);
                    }
                }
            }
        }

        private static List<By> CreateLocatorList(MemberInfo member)
        {
            List<By> bys = new List<By>();
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
            }

            return bys;
        }

        private static bool ShouldCacheLookup(MemberInfo member)
        {
            var cacheAttributeType = typeof(CacheLookupAttribute);
            bool cache = member.GetCustomAttributes(cacheAttributeType, true).Length != 0 || member.DeclaringType.GetCustomAttributes(cacheAttributeType, true).Length != 0;
            return cache;
        }

        private static object CreateProxyObject(Type memberType, ISearchContext driver, List<By> bys, bool cache)
        {
            object proxyObject = null;
            if (memberType == typeof(IList<IWebElement>))
            {
                proxyObject = new WebElementListProxy(driver, bys, cache);
            }
            else if (memberType == typeof(IWebElement))
            {
                proxyObject = new WebElementProxy(driver, bys, cache);
            }

            return proxyObject;
        }
    }
}
