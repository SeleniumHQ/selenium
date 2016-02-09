// <copyright file="FindsByAllAttribute.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks elements to indicate that found elements should match the criteria of
    /// all <see cref="FindsByAttribute"/> on the field or property.
    /// </summary>
    /// <remarks>
    /// <para>
    /// When used with a set of <see cref="FindsByAttribute"/>, all criteria must be
    /// matched to be returned. The criteria are used in sequence according to the
    /// Priority property. Note that the behavior when setting multiple
    /// <see cref="FindsByAttribute"/> Priority properties to the same value, or not
    /// specifying a Priority value, is undefined.
    /// </para>
    /// <para>
    /// <code>
    /// // Will find the element with the tag name "input" that also has an ID
    /// // attribute matching "elementId".
    /// [FindsByAll]
    /// [FindsBy(How = How.TagName, Using = "input", Priority = 0)]
    /// [FindsBy(How = How.Id, Using = "elementId", Priority = 1)]
    /// public IWebElement thisElement;
    /// </code>
    /// </para>
    /// </remarks>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public sealed class FindsByAllAttribute : Attribute
    {
    }
}
