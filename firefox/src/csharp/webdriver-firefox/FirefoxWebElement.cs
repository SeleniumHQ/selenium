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
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Allows the user to control elements on a page in Firefox.
    /// </summary>
    public class FirefoxWebElement : IRenderedWebElement, ILocatable, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByLinkText, IFindsByPartialLinkText, IFindsByXPath, IFindsByCssSelector
    {
        #region Private members
        private FirefoxDriver parentDriver;
        private string elementId;
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxWebElement"/> class.
        /// </summary>
        /// <param name="driver">The parent <see cref="FirefoxDriver"/> with which to locate the element.</param>
        /// <param name="id">The unique, opaque ID of the element.</param>
        public FirefoxWebElement(FirefoxDriver driver, string id)
        {
            parentDriver = driver;
            elementId = id;
        }
        #endregion

        #region IWebElement properties
        /// <summary>
        /// Gets a the tag name of this element.
        /// </summary>
        /// <remarks>
        /// The <see cref="TagName"/> property returns the tag name of the
        /// element, not the value of the name attribute. For example, it will return
        /// "input" for an element specifiedby the HTML markup &lt;input name="foo" /&gt;. 
        /// </remarks>
        public string TagName
        {
            get
            {
                string name = SendMessage(typeof(WebDriverException), "getTagName");
                return name;
            }
        }

        /// <summary>
        /// Gets the innerText of this element, without any leading 
        /// or trailing whitespace.
        /// </summary>
        public string Text
        {
            get
            {
                string elementText = SendMessage(typeof(WebDriverException), "getText");
                return elementText;
            }
        }

        /// <summary>
        /// Gets the content of the "value" attribute for this element.
        /// </summary>
        /// <remarks>If the content of the "value" attribute has been modified after the page has 
        /// loaded (for example, through JavaScript) then this will reflect the current value 
        /// of the "value" attribute.
        /// </remarks>
        public string Value
        {
            get
            {
                string elementValue = string.Empty;
                try
                {
                    elementValue = SendMessage(typeof(WebDriverException), "getValue");
                }
                catch (WebDriverException)
                {
                    elementValue = null;
                }

                return elementValue;
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is enabled.
        /// </summary>
        /// <remarks>The <see cref="Enabled"/> property will generally 
        /// return <see langword="true"/> for everything except explicitly disabled input elements.</remarks>
        public bool Enabled
        {
            get
            {
                string value = GetAttribute("disabled");
                return !bool.Parse(value);
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is selected.
        /// </summary>
        /// <remarks>This operation only applies to input elements such as checkboxes,
        /// options in a select element and radio buttons.</remarks>
        public bool Selected
        {
            get
            {
                string value = SendMessage(typeof(WebDriverException), "isSelected");
                return bool.Parse(value);
            }
        }
        #endregion

        #region IRenderedWebElement properties
        /// <summary>
        /// Gets the coordinates of the upper-left corner of this element relative 
        /// to the upper-left corner of the page.
        /// </summary>
        public Point Location
        {
            get
            {
                Point locationPoint = new Point();
                object result = ExecuteCommand(typeof(WebDriverException), "getLocation", null);
                Dictionary<string, object> locationObject = result as Dictionary<string, object>;
                if (locationObject != null)
                {
                    locationPoint = new Point(int.Parse(locationObject["x"].ToString(), CultureInfo.InvariantCulture), int.Parse(locationObject["y"].ToString(), CultureInfo.InvariantCulture));
                }

                return locationPoint;
            }
        }

        /// <summary>
        /// Gets the height and width of this element.
        /// </summary>
        public Size Size
        {
            get
            {
                System.Drawing.Size elementSize = new Size();
                object result = ExecuteCommand(typeof(WebDriverException), "getSize", null);
                Dictionary<string, object> sizeObject = result as Dictionary<string, object>;
                if (sizeObject != null)
                {
                    elementSize = new Size(int.Parse(sizeObject["width"].ToString(), CultureInfo.InvariantCulture), int.Parse(sizeObject["height"].ToString(), CultureInfo.InvariantCulture));
                }

                return elementSize;
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is displayed.
        /// </summary>
        /// <remarks>The <see cref="Displayed"/> property avoids the problem 
        /// of having to parse an element's "style" attribute to determine
        /// visibility of an element.</remarks>
        public bool Displayed
        {
            get
            {
                string elementIsDisplayed = SendMessage(typeof(WebDriverException), "isDisplayed");
                return bool.Parse(elementIsDisplayed);
            }
        }
        #endregion

        #region ILocatable Members
        /// <summary>
        /// Gets the location of this element on the screen, scrolling it into view
        /// if it is not currently on the screen.
        /// </summary>
        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                Point locationPoint = new Point();
                object result = ExecuteCommand(typeof(WebDriverException), "getLocationOnceScrolledIntoView", null);
                Dictionary<string, object> locationObject = result as Dictionary<string, object>;
                if (locationObject != null)
                {
                    locationPoint = new Point(int.Parse(locationObject["x"].ToString(), CultureInfo.InvariantCulture), int.Parse(locationObject["y"].ToString(), CultureInfo.InvariantCulture));
                }

                return locationPoint;
            }
        }

        #endregion

        #region Support properties
        /// <summary>
        /// Gets the internal ID of the element.
        /// </summary>
        internal string ElementId
        {
            get { return elementId; }
        }
        #endregion

        #region IWebElement methods
        /// <summary>
        /// Clears the content of this element.
        /// </summary>
        /// <remarks>If this element is a text entry element, the <see cref="Clear"/>
        /// method will clear the value. It has no effect on other elements. Text entry elements 
        /// are defined as elements with INPUT or TEXTAREA tags.</remarks>
        public void Clear()
        {
            SendMessage(typeof(NotSupportedException), "clear");
        }

        /// <summary>
        /// Simulates typing text into the element.
        /// </summary>
        /// <param name="text">The text to type into the element.</param>
        /// <remarks>The text to be typed may include special characters like arrow keys,
        /// backspaces, function keys, and so on. Valid special keys are defined in 
        /// <see cref="Keys"/>.</remarks>
        /// <seealso cref="Keys"/>
        public void SendKeys(string text)
        {
            SendMessage(typeof(NotSupportedException), "sendKeys", new object[] { text.ToCharArray() });
        }

        /// <summary>
        /// Submits this element to the web server.
        /// </summary>
        /// <remarks>If this current element is a form, or an element within a form, 
        /// then this will be submitted to the web server. If this causes the current 
        /// page to change, then this method will block until the new page is loaded.</remarks>
        public void Submit()
        {
            SendMessage(typeof(WebDriverException), "submit");
        }

        /// <summary>
        /// Clicks this element. 
        /// </summary>
        /// <remarks>
        /// <para>
        /// Click this element. If the click causes a new page to load, the <see cref="Click"/> 
        /// method will block until the page has loaded. After calling the 
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
        public void Click()
        {
            SendMessage(typeof(NotSupportedException), "click");
        }

        /// <summary>
        /// Selects this element.
        /// </summary>
        /// <remarks>The <see cref="Select"/> method is valid for radio buttons, 
        /// "option" elements within a "select" element, and checkboxes.</remarks>
        public void Select()
        {
            SendMessage(typeof(NotSupportedException), "setSelected");
        }

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
        public string GetAttribute(string attributeName)
        {
            string attributeValue = null;
            object result = ExecuteCommand(typeof(WebDriverException), "getAttribute", new object[] { attributeName });
            if (result != null)
            {
                // The JSON parser correctly converts a boolean return value to 
                // a bool object, but when bool.ToString() is called, the string
                // representation is captialized. This differs from every other
                // driver, where the boolean values are returned as strings.
                if (result is bool)
                {
                    attributeValue = result.ToString().ToLowerInvariant();
                }
                else
                {
                    attributeValue = result.ToString();
                }
            }

            return attributeValue;
        }

        /// <summary>
        /// Toggles the state of this element.
        /// </summary>
        /// <returns><see langword="true"/> if the element is selected; <see langword="false"/> otherwise.</returns>
        /// <remarks>If the element is a checkbox, the <see cref="Toggle"/> method
        /// will toggle the element's state from selected to not selected, or from not selected 
        /// to selected.</remarks>
        public bool Toggle()
        {
            SendMessage(typeof(NotImplementedException), "toggle");
            return Selected;
        }

        /// <summary>
        /// Find the first <see cref="IWebElement"/> using the given method. 
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        /// <summary>
        /// Find all <see cref="IWebElement">IWebElements</see> within the current context 
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        #endregion

        #region IRenderedWebElement methods
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
        public string GetValueOfCssProperty(string propertyName)
        {
            return SendMessage(typeof(WebDriverException), "getValueOfCssProperty", new object[] { propertyName });
        }

        /// <summary>
        /// Simulates the user hovering the mouse over this element.
        /// </summary>
        /// <remarks>The <see cref="Hover"/> method requires native events to be enabled
        /// in order to work as expected.</remarks>
        public void Hover()
        {
            SendMessage(typeof(WebDriverException), "hover", new object[] { });
        }

        /// <summary>
        /// Drags and drops this element the specified distance and direction.
        /// </summary>
        /// <param name="moveRightBy">The distance (in pixels) to drag the element to the right.</param>
        /// <param name="moveDownBy">The distance (in pixels) to drag the element to the down.</param>
        /// <remarks>To drag an element left or up, use negative values for the parameters.</remarks>
        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            SendMessage(typeof(NotSupportedException), "dragElement", new object[] { moveRightBy, moveDownBy });
        }

        /// <summary>
        /// Drags and drops an element onto another element.
        /// </summary>
        /// <param name="element">The <see cref="IRenderedWebElement"/> on which to drop this element.</param>
        public void DragAndDropOn(IRenderedWebElement element)
        {
            Point currentLocation = Location;
            Point destination = element.Location;
            DragAndDropBy(destination.X - currentLocation.X, destination.Y - currentLocation.Y);
        }
        #endregion

        #region IFindsById Members
        /// <summary>
        /// Finds the first element matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementById(string id)
        {
            return FindChildElement("id", id);
        }

        /// <summary>
        /// Finds all elements matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return FindChildElements("id", id);
        }
        #endregion

        #region IFindsByName Members
        /// <summary>
        /// Finds the first element matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByName(string name)
        {
            return FindChildElement("name", name);
        }

        /// <summary>
        /// Finds all elements matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return FindChildElements("name", name);
        }
        #endregion

        #region IFindsByTagName Members
        /// <summary>
        /// Finds the first element matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByTagName(string tagName)
        {
            return FindChildElement("tag name", tagName);
        }

        /// <summary>
        /// Finds all elements matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return FindChildElements("tag name", tagName);
        }
        #endregion

        #region IFindsByClassName Members
        /// <summary>
        /// Finds the first element matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByClassName(string className)
        {
            return FindChildElement("class name", className);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            return FindChildElements("class name", className);
        }
        #endregion

        #region IFindsByLinkText Members
        /// <summary>
        /// Finds the first element matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return FindChildElement("link text", linkText);
        }

        /// <summary>
        /// Finds all elements matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return FindChildElements("link text", linkText);
        }
        #endregion

        #region IFindsByPartialLinkText Members
        /// <summary>
        /// Finds the first element matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return FindChildElement("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds all elements matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return FindChildElements("partial link text", partialLinkText);
        }
        #endregion

        #region IFindsByXPath Members
        /// <summary>
        /// Finds the first element matching the specified XPath query.
        /// </summary>
        /// <param name="xpath">The XPath query to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByXPath(string xpath)
        {
            return FindChildElement("xpath", xpath);
        }

        /// <summary>
        /// Finds all elements matching the specified XPath query.
        /// </summary>
        /// <param name="xpath">The XPath query to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return FindChildElements("xpath", xpath);
        }
        #endregion

        #region IFindsByCssSelector Members
        /// <summary>
        /// Finds the first element matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return FindChildElement("css selector", cssSelector);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return FindChildElements("css selector", cssSelector);
        }

        #endregion

        #region Overrides
        /// <summary>
        /// Determines whether two <see cref="FirefoxWebElement"/> instances are equal.
        /// </summary>
        /// <param name="obj">The <see cref="FirefoxWebElement"/> to compare with the current <see cref="FirefoxWebElement"/>.</param>
        /// <returns><see langword="true"/> if the specified <see cref="FirefoxWebElement"/> is equal to the 
        /// current <see cref="FirefoxWebElement"/>; otherwise, <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            IWebElement other = obj as IWebElement;

            if (other == null)
            {
                return false;
            }

            if (other is IWrapsElement)
            {
                other = ((IWrapsElement)obj).WrappedElement;
            }

            FirefoxWebElement otherAsElement = other as FirefoxWebElement;
            if (otherAsElement == null)
            {
                return false;
            }

            return elementId == otherAsElement.ElementId;
        }

        /// <summary>
        /// Serves as a hash function for a <see cref="FirefoxWebElement"/>.
        /// </summary>
        /// <returns>A hash code for the current <see cref="FirefoxWebElement"/>.</returns>
        public override int GetHashCode()
        {
            return elementId.GetHashCode();
        }
        #endregion

        #region Support methods
        private string SendMessage(Type throwOnFailure, string methodName)
        {
            return SendMessage(throwOnFailure, methodName, null);
        }

        private string SendMessage(Type throwOnFailure, string methodName, object[] parameters)
        {
            object result = ExecuteCommand(throwOnFailure, methodName, parameters);
            return result == null ? null : result.ToString();
        }

        private object ExecuteCommand(Type throwOnFailure, string methodName, object[] parameters)
        {
            return parentDriver.ExecuteCommand(throwOnFailure, new Command(parentDriver.Context, elementId, methodName, parameters));
        }

        private IWebElement FindChildElement(string mechanism, string value)
        {
            string id = SendMessage(typeof(NoSuchElementException), "findChildElement", BuildSearchParamsMap(mechanism, value));
            return new FirefoxWebElement(parentDriver, id);
        }

        private ReadOnlyCollection<IWebElement> FindChildElements(string mechanism, string value)
        {
            object[] ids = (object[])ExecuteCommand(typeof(WebDriverException), "findChildElements", BuildSearchParamsMap(mechanism, value));

            List<IWebElement> elements = new List<IWebElement>();
            try
            {
                foreach (object id in ids)
                {
                    elements.Add(new FirefoxWebElement(parentDriver, id.ToString()));
                }
            }
            catch (Exception e)
            {
                throw new WebDriverException(string.Empty, e);
            }

            return new ReadOnlyCollection<IWebElement>(elements);
        }

        private object[] BuildSearchParamsMap(string mechanism, string value)
        {
            Dictionary<string, string> map = new Dictionary<string, string>();
            map.Add("id", elementId);
            map.Add("using", mechanism);
            map.Add("value", value);
            return new object[] { map };
        }
        #endregion
    }
}
