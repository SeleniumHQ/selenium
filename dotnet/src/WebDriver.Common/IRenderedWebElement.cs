/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user controls drawn elements on the page.
    /// </summary>
    public interface IRenderedWebElement : IWebElement
    {
        /// <summary>
        /// Gets the coordinates of the upper-left corner of this element relative 
        /// to the upper-left corner of the page.
        /// </summary>
        Point Location { get; }

        /// <summary>
        /// Gets the height and width of this element.
        /// </summary>
        Size Size { get; }

        /// <summary>
        /// Gets a value indicating whether or not this element is displayed.
        /// </summary>
        /// <remarks>The <see cref="Displayed"/> property avoids the problem 
        /// of having to parse an element's "style" attribute to determine
        /// visibility of an element.</remarks>
        bool Displayed { get; }
        
        /// <summary>
        /// Gets the value of a CSS property of this element.
        /// </summary>
        /// <param name="propertyName">The name of the CSS property to get the value of.</param>
        /// <returns>The value of the specified CSS property.</returns>
        /// <remarks>The value returned by the <see cref="GetValueOfCssProperty"/>
        /// method is likely to be unpredictable in a cross-browser environment. 
        /// Color values should be returned as hex strings. For example, a 
        /// "background-color" property set as "green" in the HTML source, will
        /// return "#008000" for its value.</remarks>
        string GetValueOfCssProperty(string propertyName);

        /// <summary>
        /// Simulates the user hovering the mouse over this element.
        /// </summary>
        /// <remarks>The <see cref="Hover"/> method requires native events to be enabled
        /// in order to work as expected.</remarks>
        void Hover();
        
        /// <summary>
        /// Drags and drops this element the specified distance and direction.
        /// </summary>
        /// <param name="moveRightBy">The distance (in pixels) to drag the element to the right.</param>
        /// <param name="moveDownBy">The distance (in pixels) to drag the element to the down.</param>
        /// <remarks>To drag an element left or up, use negative values for the parameters.</remarks>
        void DragAndDropBy(int moveRightBy, int moveDownBy);

        /// <summary>
        /// Drags and drops an element onto another element.
        /// </summary>
        /// <param name="element">The <see cref="IRenderedWebElement"/> on which to drop this element.</param>
        void DragAndDropOn(IRenderedWebElement element);
    }
}
