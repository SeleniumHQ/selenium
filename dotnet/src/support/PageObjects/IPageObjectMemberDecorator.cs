// <copyright file="IPageObjectMemberDecorator.cs" company="WebDriver Committers">
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

using System.Reflection;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Interface describing how members of a class which represent elements in a Page Object
    /// are detected.
    /// </summary>
    public interface IPageObjectMemberDecorator
    {
        /// <summary>
        /// Locates an element or list of elements for a Page Object member, and returns a
        /// proxy object for the element or list of elements.
        /// </summary>
        /// <param name="member">The <see cref="MemberInfo"/> containing information about
        /// a class's member.</param>
        /// <param name="locator">The <see cref="IElementLocator"/> used to locate elements.</param>
        /// <returns>A transparent proxy to the WebDriver element object.</returns>
        object Decorate(MemberInfo member, IElementLocator locator);
    }
}
