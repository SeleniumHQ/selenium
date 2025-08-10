// <copyright file="ShadowRoot.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics.CodeAnalysis;

namespace OpenQA.Selenium;

/// <summary>
/// Provides a representation of an element's shadow root.
/// </summary>
public class ShadowRoot : ISearchContext, IWrapsDriver, IWebDriverObjectReference
{
    /// <summary>
    /// The property name that represents an element shadow root in the wire protocol.
    /// </summary>
    public const string ShadowRootReferencePropertyName = "shadow-6066-11e4-a52e-4f735466cecf";

    private readonly WebDriver driver;
    private readonly string shadowRootId;

    /// <summary>
    /// Initializes a new instance of the <see cref="ShadowRoot"/> class.
    /// </summary>
    /// <param name="parentDriver">The <see cref="WebDriver"/> instance that is driving this shadow root.</param>
    /// <param name="id">The ID value provided to identify the shadow root.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="parentDriver"/> or <paramref name="id"/> are <see langword="null"/>.</exception>
    public ShadowRoot(WebDriver parentDriver, string id)
    {
        this.driver = parentDriver ?? throw new ArgumentNullException(nameof(parentDriver));
        this.shadowRootId = id ?? throw new ArgumentNullException(nameof(id));
    }

    /// <summary>
    /// Gets the <see cref="IWebDriver"/> driving this shadow root.
    /// </summary>
    public IWebDriver WrappedDriver => this.driver;

    /// <summary>
    /// Gets the internal ID for this ShadowRoot.
    /// </summary>
    string IWebDriverObjectReference.ObjectReferenceId => this.shadowRootId;

    internal static bool TryCreate(WebDriver parentDriver, Dictionary<string, object?> shadowRootDictionary, [NotNullWhen(true)] out ShadowRoot? shadowRoot)
    {
        if (shadowRootDictionary is null)
        {
            throw new ArgumentNullException(nameof(shadowRootDictionary), "The dictionary containing the shadow root reference cannot be null");
        }

        if (shadowRootDictionary.TryGetValue(ShadowRootReferencePropertyName, out object? shadowRootValue))
        {
            shadowRoot = new ShadowRoot(parentDriver, shadowRootValue?.ToString()!);
            return true;
        }

        shadowRoot = null;
        return false;
    }

    /// <summary>
    /// Finds the first <see cref="IWebElement"/> using the given method.
    /// </summary>
    /// <param name="by">The locating mechanism to use.</param>
    /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="by"/> is <see langword="null"/>.</exception>
    /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
    public IWebElement FindElement(By by)
    {
        if (by is null)
        {
            throw new ArgumentNullException(nameof(by), "by cannot be null");
        }

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.shadowRootId);
        parameters.Add("using", by.Mechanism);
        parameters.Add("value", by.Criteria);

        Response commandResponse = this.driver.Execute(DriverCommand.FindShadowChildElement, parameters);
        return this.driver.GetElementFromResponse(commandResponse)!;
    }

    /// <summary>
    /// Finds all <see cref="IWebElement">IWebElements</see> within the current context
    /// using the given mechanism.
    /// </summary>
    /// <param name="by">The locating mechanism to use.</param>
    /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
    /// matching the current criteria, or an empty list if nothing matches.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="by"/> is <see langword="null"/>.</exception>
    public ReadOnlyCollection<IWebElement> FindElements(By by)
    {
        if (by is null)
        {
            throw new ArgumentNullException(nameof(by), "by cannot be null");
        }

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.shadowRootId);
        parameters.Add("using", by.Mechanism);
        parameters.Add("value", by.Criteria);

        Response commandResponse = this.driver.Execute(DriverCommand.FindShadowChildElements, parameters);
        return this.driver.GetElementsFromResponse(commandResponse);
    }

    Dictionary<string, object> IWebDriverObjectReference.ToDictionary()
    {
        return new Dictionary<string, object>
        {
            [ShadowRootReferencePropertyName] = this.shadowRootId
        };
    }
}
