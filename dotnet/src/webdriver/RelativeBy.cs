// <copyright file="RelativeBy.cs" company="Selenium Committers">
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
using System.Globalization;
using System.IO;

namespace OpenQA.Selenium;

/// <summary>
/// Provides a mechanism for finding elements spatially relative to other elements.
/// </summary>
public sealed class RelativeBy : By
{
    private readonly string wrappedAtom;
    private readonly object root;
    private readonly List<object> filters = new List<object>();

    private static string GetWrappedAtom()
    {
        string atom;
        using (Stream atomStream = ResourceUtilities.GetResourceStream("find-elements.js", "find-elements.js"))
        {
            using (StreamReader atomReader = new StreamReader(atomStream))
            {
                atom = atomReader.ReadToEnd();
            }
        }

        return string.Format(CultureInfo.InvariantCulture, "/* findElements */return ({0}).apply(null, arguments);", atom);
    }

    private RelativeBy(object root, List<object>? filters = null)
    {
        this.wrappedAtom = GetWrappedAtom();
        this.root = GetSerializableRoot(root);
        if (filters != null)
        {
            this.filters.AddRange(filters);
        }
    }

    /// <summary>
    /// Creates a new <see cref="RelativeBy"/> for finding elements with the specified tag name.
    /// </summary>
    /// <param name="by">A By object that will be used to find the initial element.</param>
    /// <returns>A <see cref="RelativeBy"/> object to be used in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="by"/> is null.</exception>
    public static RelativeBy WithLocator(By by)
    {
        return new RelativeBy(by);
    }

    /// <summary>
    /// Finds the first element matching the criteria.
    /// </summary>
    /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
    /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
    /// <exception cref="ArgumentException">If <paramref name="context"/> is not <see cref="IJavaScriptExecutor"/> or wraps a driver that does.</exception>
    public override IWebElement FindElement(ISearchContext context)
    {
        ReadOnlyCollection<IWebElement> elements = FindElements(context);
        if (elements.Count == 0)
        {
            throw new NoSuchElementException("Unable to find element");
        }

        return elements[0];
    }

    /// <summary>
    /// Finds all elements matching the criteria.
    /// </summary>
    /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
    /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
    /// matching the current criteria, or an empty list if nothing matches.</returns>
    /// <exception cref="ArgumentException">If <paramref name="context"/> is not <see cref="IJavaScriptExecutor"/> or wraps a driver that does.</exception>
    public override ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
    {
        IJavaScriptExecutor js = GetExecutor(context);
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        Dictionary<string, object> filterParameters = new Dictionary<string, object>();
        filterParameters["root"] = GetSerializableObject(this.root);
        filterParameters["filters"] = this.filters;
        parameters["relative"] = filterParameters;
        object? rawElements = js.ExecuteScript(wrappedAtom, parameters);

        if (rawElements is ReadOnlyCollection<IWebElement> elements)
        {
            return elements;
        }

        // De-serializer quirk - if the response is empty then the de-serializer will not know we're getting back elements
        // We will have a ReadOnlyCollection<object>

        if (rawElements is ReadOnlyCollection<object> elementsObj)
        {
            if (elementsObj.Count == 0)
            {
#if NET8_0_OR_GREATER
                return ReadOnlyCollection<IWebElement>.Empty;
#else
                return new List<IWebElement>().AsReadOnly();
#endif
            }
        }

        throw new WebDriverException($"Could not de-serialize element list response{Environment.NewLine}{rawElements}");
    }

    /// <summary>
    /// Locates an element above the specified element.
    /// </summary>
    /// <param name="element">The element to look above for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    public RelativeBy Above(IWebElement element)
    {
        if (element == null)
        {
            throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
        }

        return SimpleDirection("above", element);
    }

    /// <summary>
    /// Locates an element above the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look above for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    public RelativeBy Above(By locator)
    {
        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
        }

        return SimpleDirection("above", locator);
    }

    /// <summary>
    /// Locates an element below the specified element.
    /// </summary>
    /// <param name="element">The element to look below for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    public RelativeBy Below(IWebElement element)
    {
        if (element == null)
        {
            throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
        }

        return SimpleDirection("below", element);
    }

    /// <summary>
    /// Locates an element below the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look below for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    public RelativeBy Below(By locator)
    {
        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
        }

        return SimpleDirection("below", locator);
    }

    /// <summary>
    /// Locates an element to the left of the specified element.
    /// </summary>
    /// <param name="element">The element to look to the left of for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    public RelativeBy LeftOf(IWebElement element)
    {
        if (element == null)
        {
            throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
        }

        return SimpleDirection("left", element);
    }

    /// <summary>
    /// Locates an element to the left of the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look to the left of for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    public RelativeBy LeftOf(By locator)
    {
        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
        }

        return SimpleDirection("left", locator);
    }

    /// <summary>
    /// Locates an element to the right of the specified element.
    /// </summary>
    /// <param name="element">The element to look to the right of for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    public RelativeBy RightOf(IWebElement element)
    {
        if (element == null)
        {
            throw new ArgumentNullException(nameof(element), "Element relative to cannot be null");
        }

        return SimpleDirection("right", element);
    }

    /// <summary>
    /// Locates an element to the right of the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look to the right of for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    public RelativeBy RightOf(By locator)
    {
        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
        }

        return SimpleDirection("right", locator);
    }

    /// <summary>
    /// Locates an element near the specified element.
    /// </summary>
    /// <param name="element">The element to look near for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    public RelativeBy Near(IWebElement element)
    {
        return Near(element, 50);
    }

    /// <summary>
    /// Locates an element near the specified element.
    /// </summary>
    /// <param name="element">The element to look near for elements.</param>
    /// <param name="atMostDistanceInPixels">The maximum distance from the element to be considered "near."</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="element"/> is null.</exception>
    /// <exception cref="ArgumentOutOfRangeException">If <paramref name="atMostDistanceInPixels"/> is not a positive value.</exception>
    public RelativeBy Near(IWebElement element, int atMostDistanceInPixels)
    {
        return Near((object)element, atMostDistanceInPixels);
    }

    /// <summary>
    /// Locates an element near the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look near for elements.</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    public RelativeBy Near(By locator)
    {
        return Near(locator, 50);
    }

    /// <summary>
    /// Locates an element near the specified element.
    /// </summary>
    /// <param name="locator">The locator describing the element to look near for elements.</param>
    /// <param name="atMostDistanceInPixels">The maximum distance from the element to be considered "near."</param>
    /// <returns>A <see cref="RelativeBy"/> object for use in finding the elements.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="locator"/> is null.</exception>
    /// <exception cref="ArgumentOutOfRangeException">If <paramref name="atMostDistanceInPixels"/> is not a positive value.</exception>
    public RelativeBy Near(By locator, int atMostDistanceInPixels)
    {
        return Near((object)locator, atMostDistanceInPixels);
    }

    private RelativeBy Near(object locator, int atMostDistanceInPixels)
    {
        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Locator to use to search must be set");
        }

        if (atMostDistanceInPixels <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(atMostDistanceInPixels), "Distance must be greater than zero");
        }

        Dictionary<string, object> filter = new Dictionary<string, object>();
        filter["kind"] = "near";
        filter["args"] = new List<object>() { GetSerializableObject(locator), atMostDistanceInPixels };
        this.filters.Add(filter);

        return new RelativeBy(this.root, this.filters);
    }

    private RelativeBy SimpleDirection(string direction, object locator)
    {
        if (string.IsNullOrEmpty(direction))
        {
            throw new ArgumentNullException(nameof(direction), "Direction cannot be null or the empty string");
        }

        if (locator == null)
        {
            throw new ArgumentNullException(nameof(locator), "Element locator to cannot be null");
        }

        Dictionary<string, object> filter = new Dictionary<string, object>();
        filter["kind"] = direction;
        filter["args"] = new List<object>() { GetSerializableObject(locator) };
        this.filters.Add(filter);

        return new RelativeBy(this.root, this.filters);
    }

    private static object GetSerializableRoot(object root)
    {
        if (root == null)
        {
            throw new ArgumentNullException(nameof(root), "object to serialize must not be null");
        }

        if (root is By asBy)
        {
            return asBy;
        }

        if (root is IWebElement element)
        {
            return element;
        }

        if (root is IWrapsElement wrapper)
        {
            return wrapper.WrappedElement;
        }

        throw new WebDriverException("Serializable locator must be a By, an IWebElement, or a wrapped element using IWrapsElement");
    }

    private static object GetSerializableObject(object root)
    {
        if (root == null)
        {
            throw new ArgumentNullException(nameof(root), "object to serialize must not be null");
        }

        if (root is By asBy)
        {
            Dictionary<string, object> serializedBy = new Dictionary<string, object>();
            serializedBy[asBy.Mechanism] = asBy.Criteria;
            return serializedBy;
        }

        if (root is IWebElement element)
        {
            return element;
        }

        if (root is IWrapsElement wrapper)
        {
            return wrapper.WrappedElement;
        }

        throw new WebDriverException("Serializable locator must be a By, an IWebElement, or a wrapped element using IWrapsElement");
    }

    private static IJavaScriptExecutor GetExecutor(ISearchContext context)
    {
        IJavaScriptExecutor? executor = context as IJavaScriptExecutor;
        if (executor != null)
        {
            return executor;
        }

        IWrapsDriver? current = context as IWrapsDriver;
        while (current != null)
        {
            IWebDriver driver = current.WrappedDriver;
            executor = driver as IJavaScriptExecutor;
            if (executor != null)
            {
                break;
            }

            current = driver as IWrapsDriver;
        }

        if (executor == null)
        {
            throw new ArgumentException("Search context must support JavaScript or IWrapsDriver where the wrapped driver supports JavaScript", nameof(context));
        }

        return executor;
    }
}
