// <copyright file="IWebElement.cs" company="WebDriver Committers">
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

using System.Drawing;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user controls elements on the page.
    /// </summary>
    /// <remarks>The <see cref="IWebElement"/> interface represents an HTML element.
    /// Generally, all interesting operations to do with interacting with a page will
    /// be performed through this interface.
    /// </remarks>
    public interface IWebElement : ISearchContext
    {
        /// <summary>
        /// Gets the tag name of this element.
        /// </summary>
        /// <remarks>
        /// The <see cref="TagName"/> property returns the tag name of the
        /// element, not the value of the name attribute. For example, it will return
        /// "input" for an element specified by the HTML markup &lt;input name="foo" /&gt;.
        /// </remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        string TagName { get; }

        /// <summary>
        /// Gets the innerText of this element, without any leading or trailing whitespace,
        /// and with other whitespace collapsed.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        string Text { get; }

        /// <summary>
        /// Gets a value indicating whether or not this element is enabled.
        /// </summary>
        /// <remarks>The <see cref="Enabled"/> property will generally
        /// return <see langword="true"/> for everything except explicitly disabled input elements.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        bool Enabled { get; }

        /// <summary>
        /// Gets a value indicating whether or not this element is selected.
        /// </summary>
        /// <remarks>This operation only applies to input elements such as checkboxes,
        /// options in a select element and radio buttons.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        bool Selected { get; }

        /// <summary>
        /// Gets a <see cref="Point"/> object containing the coordinates of the upper-left corner
        /// of this element relative to the upper-left corner of the page.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        Point Location { get; }

        /// <summary>
        /// Gets a <see cref="Size"/> object containing the height and width of this element.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        Size Size { get; }

        /// <summary>
        /// Gets a value indicating whether or not this element is displayed.
        /// </summary>
        /// <remarks>The <see cref="Displayed"/> property avoids the problem
        /// of having to parse an element's "style" attribute to determine
        /// visibility of an element.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        bool Displayed { get; }

        /// <summary>
        /// Clears the content of this element.
        /// </summary>
        /// <remarks>If this element is a text entry element, the <see cref="Clear"/>
        /// method will clear the value. It has no effect on other elements. Text entry elements
        /// are defined as elements with INPUT or TEXTAREA tags.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        void Clear();

        /// <summary>
        /// Simulates typing text into the element.
        /// </summary>
        /// <param name="text">The text to type into the element.</param>
        /// <remarks>The text to be typed may include special characters like arrow keys,
        /// backspaces, function keys, and so on. Valid special keys are defined in
        /// <see cref="Keys"/>.</remarks>
        /// <seealso cref="Keys"/>
        /// <exception cref="InvalidElementStateException">Thrown when the target element is not enabled.</exception>
        /// <exception cref="ElementNotVisibleException">Thrown when the target element is not visible.</exception>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        void SendKeys(string text);

        /// <summary>
        /// Submits this element to the web server.
        /// </summary>
        /// <remarks>If this current element is a form, or an element within a form,
        /// then this will be submitted to the web server. If this causes the current
        /// page to change, then this method will block until the new page is loaded.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        void Submit();

        /// <summary>
        /// Clicks this element.
        /// </summary>
        /// <remarks>
        /// <para>
        /// Click this element. If the click causes a new page to load, the <see cref="Click"/>
        /// method will attempt to block until the page has loaded. After calling the
        /// <see cref="Click"/> method, you should discard all references to this
        /// element unless you know that the element and the page will still be present.
        /// Otherwise, any further operations performed on this element will have an undefined.
        /// behavior.
        /// </para>
        /// <para>
        /// If this element is not clickable, then this operation is ignored. This allows you to
        /// simulate a users to accidentally missing the target when clicking.
        /// </para>
        /// </remarks>
        /// <exception cref="ElementNotVisibleException">Thrown when the target element is not visible.</exception>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        void Click();

        /// <summary>
        /// Gets the value of the specified attribute for this element.
        /// </summary>
        /// <param name="attributeName">The name of the attribute.</param>
        /// <returns>The attribute's current value. Returns a <see langword="null"/> if the
        /// value is not set.</returns>
        /// <remarks>The <see cref="GetAttribute"/> method will return the current value
        /// of the attribute, even if the value has been modified after the page has been
        /// loaded. Note that the value of the following attributes will be returned even if
        /// there is no explicit attribute on the element:
        /// <list type="table">
        /// <listheader>
        /// <term>Attribute name</term>
        /// <term>Value returned if not explicitly specified</term>
        /// <term>Valid element types</term>
        /// </listheader>
        /// <item>
        /// <description>checked</description>
        /// <description>checked</description>
        /// <description>Check Box</description>
        /// </item>
        /// <item>
        /// <description>selected</description>
        /// <description>selected</description>
        /// <description>Options in Select elements</description>
        /// </item>
        /// <item>
        /// <description>disabled</description>
        /// <description>disabled</description>
        /// <description>Input and other UI elements</description>
        /// </item>
        /// </list>
        /// </remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        string GetAttribute(string attributeName);

        /// <summary>
        /// Gets the value of a JavaScript property of this element.
        /// </summary>
        /// <param name="propertyName">The name JavaScript the JavaScript property to get the value of.</param>
        /// <returns>The JavaScript property's current value. Returns a <see langword="null"/> if the
        /// value is not set or the property does not exist.</returns>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        string GetProperty(string propertyName);

        /// <summary>
        /// Gets the value of a CSS property of this element.
        /// </summary>
        /// <param name="propertyName">The name of the CSS property to get the value of.</param>
        /// <returns>The value of the specified CSS property.</returns>
        /// <remarks>The value returned by the <see cref="GetCssValue"/>
        /// method is likely to be unpredictable in a cross-browser environment.
        /// Color values should be returned as hex strings. For example, a
        /// "background-color" property set as "green" in the HTML source, will
        /// return "#008000" for its value.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        string GetCssValue(string propertyName);
    }
}
