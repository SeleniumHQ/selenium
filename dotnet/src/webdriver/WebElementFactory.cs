// <copyright file="WebElementFactory.cs" company="Selenium Committers">
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

using System;
using System.Collections.Generic;

namespace OpenQA.Selenium;

/// <summary>
/// Object used to create <see cref="WebElement"/> objects for a remote driver instance.
/// </summary>
public class WebElementFactory
{
    /// <summary>
    /// Initializes a new instance of the <see cref="WebElementFactory"/> class.
    /// </summary>
    /// <param name="parentDriver">The <see cref="WebDriver"/> object used to locate the elements.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="parentDriver"/> is <see langword="null"/>.</exception>
    public WebElementFactory(WebDriver parentDriver)
    {
        this.ParentDriver = parentDriver ?? throw new ArgumentNullException(nameof(parentDriver));
    }

    /// <summary>
    /// Gets the <see cref="WebDriver"/> instance used to locate elements.
    /// </summary>
    protected WebDriver ParentDriver { get; }

    /// <summary>
    /// Creates a <see cref="WebElement"/> from a dictionary containing a reference to an element.
    /// </summary>
    /// <param name="elementDictionary">The dictionary containing the element reference.</param>
    /// <returns>A <see cref="WebElement"/> containing the information from the specified dictionary.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="elementDictionary"/> is <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">If the dictionary does not contain the element reference property name.</exception>
    /// <exception cref="InvalidOperationException">If the element property is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public virtual WebElement CreateElement(Dictionary<string, object?> elementDictionary)
    {
        string elementId = this.GetElementId(elementDictionary);
        return new WebElement(this.ParentDriver, elementId);
    }

    /// <summary>
    /// Gets a value indicating whether the specified dictionary represents a reference to a web element.
    /// </summary>
    /// <param name="elementDictionary">The dictionary to check.</param>
    /// <returns><see langword="true"/> if the dictionary contains an element reference; otherwise, <see langword="false"/>.</returns>
    public bool ContainsElementReference(Dictionary<string, object?> elementDictionary)
    {
        if (elementDictionary == null)
        {
            throw new ArgumentNullException(nameof(elementDictionary), "The dictionary containing the element reference cannot be null");
        }

        return elementDictionary.ContainsKey(WebElement.ElementReferencePropertyName);
    }

    /// <summary>
    /// Gets the internal ID associated with the element.
    /// </summary>
    /// <param name="elementDictionary">A dictionary containing the element reference.</param>
    /// <returns>The internal ID associated with the element.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="elementDictionary"/> is <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">If the dictionary does not contain the element reference property name.</exception>
    /// <exception cref="InvalidOperationException">If the element property is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public string GetElementId(Dictionary<string, object?> elementDictionary)
    {
        if (elementDictionary == null)
        {
            throw new ArgumentNullException(nameof(elementDictionary), "The dictionary containing the element reference cannot be null");
        }

        if (!elementDictionary.TryGetValue(WebElement.ElementReferencePropertyName, out object? elementIdObj))
        {
            throw new ArgumentException("elementDictionary", "The specified dictionary does not contain an element reference");
        }

        string? elementId = elementIdObj?.ToString();
        if (string.IsNullOrEmpty(elementId))
        {
            throw new InvalidOperationException("The specified element ID is either null or the empty string.");
        }

        return elementId!;
    }
}
