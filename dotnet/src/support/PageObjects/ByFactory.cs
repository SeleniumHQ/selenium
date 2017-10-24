// <copyright file="ByFactory.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Reflection;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides instances of the <see cref="By"/> object to the attributes.
    /// </summary>
    internal static class ByFactory
    {
        /// <summary>
        /// Gets an instance of the <see cref="By"/> class based on the specified attribute.
        /// </summary>
        /// <param name="attribute">The <see cref="FindsByAttribute"/> describing how to find the element.</param>
        /// <returns>An instance of the <see cref="By"/> class.</returns>
        public static By From(FindsByAttribute attribute)
        {
            var how = attribute.How;
            var usingValue = attribute.Using;
            switch (how)
            {
                case How.Id:
                    return By.Id(usingValue);
                case How.Name:
                    return By.Name(usingValue);
                case How.TagName:
                    return By.TagName(usingValue);
                case How.ClassName:
                    return By.ClassName(usingValue);
                case How.CssSelector:
                    return By.CssSelector(usingValue);
                case How.LinkText:
                    return By.LinkText(usingValue);
                case How.PartialLinkText:
                    return By.PartialLinkText(usingValue);
                case How.XPath:
                    return By.XPath(usingValue);
                case How.Custom:
                    if (attribute.CustomFinderType == null)
                    {
                        throw new ArgumentException("Cannot use How.Custom without supplying a custom finder type");
                    }

                    if (!attribute.CustomFinderType.IsSubclassOf(typeof(By)))
                    {
                        throw new ArgumentException("Custom finder type must be a descendent of the By class");
                    }

                    ConstructorInfo ctor = attribute.CustomFinderType.GetConstructor(new Type[] { typeof(string) });
                    if (ctor == null)
                    {
                        throw new ArgumentException("Custom finder type must expose a public constructor with a string argument");
                    }

                    By finder = ctor.Invoke(new object[] { usingValue }) as By;
                    return finder;
            }

            throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "Did not know how to construct How from how {0}, using {1}", how, usingValue));
        }
    }
}
