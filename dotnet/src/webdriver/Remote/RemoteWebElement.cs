// <copyright file="RemoteWebElement.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using OpenQA.Selenium.Interactions.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// RemoteWebElement allows you to have access to specific items that are found on the page
    /// </summary>
    /// <seealso cref="IWebElement"/>
    /// <seealso cref="ILocatable"/>
    public class RemoteWebElement : IWebElement, IFindsByLinkText, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByXPath, IFindsByPartialLinkText, IFindsByCssSelector, IWrapsDriver, ILocatable, ITakesScreenshot
    {
        private RemoteWebDriver driver;
        private string elementId;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebElement"/> class.
        /// </summary>
        /// <param name="parentDriver">The <see cref="RemoteWebDriver"/> instance hosting this element.</param>
        /// <param name="id">The ID assigned to the element.</param>
        public RemoteWebElement(RemoteWebDriver parentDriver, string id)
        {
            this.driver = parentDriver;
            this.elementId = id;
        }

        /// <summary>
        /// Gets the <see cref="IWebDriver"/> used to find this element.
        /// </summary>
        public IWebDriver WrappedDriver
        {
            get { return this.driver; }
        }

        /// <summary>
        /// Gets the tag name of this element.
        /// </summary>
        /// <remarks>
        /// The <see cref="TagName"/> property returns the tag name of the
        /// element, not the value of the name attribute. For example, it will return
        /// "input" for an element specified by the HTML markup &lt;input name="foo" /&gt;.
        /// </remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public string TagName
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.elementId);
                Response commandResponse = this.Execute(DriverCommand.GetElementTagName, parameters);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the innerText of this element, without any leading or trailing whitespace,
        /// and with other whitespace collapsed.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public string Text
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.elementId);
                Response commandResponse = this.Execute(DriverCommand.GetElementText, parameters);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is enabled.
        /// </summary>
        /// <remarks>The <see cref="Enabled"/> property will generally
        /// return <see langword="true"/> for everything except explicitly disabled input elements.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public bool Enabled
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.elementId);
                Response commandResponse = this.Execute(DriverCommand.IsElementEnabled, parameters);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is selected.
        /// </summary>
        /// <remarks>This operation only applies to input elements such as checkboxes,
        /// options in a select element and radio buttons.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public bool Selected
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.elementId);
                Response commandResponse = this.Execute(DriverCommand.IsElementSelected, parameters);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Gets a <see cref="Point"/> object containing the coordinates of the upper-left corner
        /// of this element relative to the upper-left corner of the page.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public Point Location
        {
            get
            {
                string getLocationCommand = DriverCommand.GetElementLocation;
                if (this.driver.IsSpecificationCompliant)
                {
                    getLocationCommand = DriverCommand.GetElementRect;
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.Id);
                Response commandResponse = this.Execute(getLocationCommand, parameters);
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        /// <summary>
        /// Gets a <see cref="Size"/> object containing the height and width of this element.
        /// </summary>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public Size Size
        {
            get
            {
                string getSizeCommand = DriverCommand.GetElementSize;
                if (this.driver.IsSpecificationCompliant)
                {
                    getSizeCommand = DriverCommand.GetElementRect;
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.Id);
                Response commandResponse = this.Execute(getSizeCommand, parameters);
                Dictionary<string, object> rawSize = (Dictionary<string, object>)commandResponse.Value;
                int width = Convert.ToInt32(rawSize["width"], CultureInfo.InvariantCulture);
                int height = Convert.ToInt32(rawSize["height"], CultureInfo.InvariantCulture);
                return new Size(width, height);
            }
        }

        /// <summary>
        /// Gets a value indicating whether or not this element is displayed.
        /// </summary>
        /// <remarks>The <see cref="Displayed"/> property avoids the problem
        /// of having to parse an element's "style" attribute to determine
        /// visibility of an element.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public bool Displayed
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.Id);
                Response commandResponse = this.Execute(DriverCommand.IsElementDisplayed, parameters);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Gets the point where the element would be when scrolled into view.
        /// </summary>
        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                Response commandResponse;
                Dictionary<string, object> rawLocation;
                if (this.driver.IsSpecificationCompliant)
                {
                    rawLocation = this.driver.ExecuteScript("return arguments[0].getBoundingClientRect();", this) as Dictionary<string, object>;
                }
                else
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>();
                    parameters.Add("id", this.Id);
                    commandResponse = this.Execute(DriverCommand.GetElementLocationOnceScrolledIntoView, parameters);
                    rawLocation = (Dictionary<string, object>)commandResponse.Value;
                }

                int x = Convert.ToInt32(rawLocation["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawLocation["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        /// <summary>
        /// Gets the coordinates identifying the location of this element using
        /// various frames of reference.
        /// </summary>
        public ICoordinates Coordinates
        {
            get { return new RemoteCoordinates(this); }
        }

        /// <summary>
        /// Gets the ID of the element.
        /// </summary>
        /// <remarks>This property is internal to the WebDriver instance, and is
        /// not intended to be used in your code. The element's ID has no meaning
        /// outside of internal WebDriver usage, so it would be improper to scope
        /// it as public. However, both subclasses of <see cref="RemoteWebElement"/>
        /// and the parent driver hosting the element have a need to access the
        /// internal element ID. Therefore, we have two properties returning the
        /// same value, one scoped as internal, the other as protected.</remarks>
        internal string InternalElementId
        {
            get { return this.elementId; }
        }

        /// <summary>
        /// Gets the ID of the element
        /// </summary>
        /// <remarks>This property is internal to the WebDriver instance, and is
        /// not intended to be used in your code. The element's ID has no meaning
        /// outside of internal WebDriver usage, so it would be improper to scope
        /// it as public. However, both subclasses of <see cref="RemoteWebElement"/>
        /// and the parent driver hosting the element have a need to access the
        /// internal element ID. Therefore, we have two properties returning the
        /// same value, one scoped as internal, the other as protected.</remarks>
        protected string Id
        {
            get { return this.elementId; }
        }

        /// <summary>
        /// Clears the content of this element.
        /// </summary>
        /// <remarks>If this element is a text entry element, the <see cref="Clear"/>
        /// method will clear the value. It has no effect on other elements. Text entry elements
        /// are defined as elements with INPUT or TEXTAREA tags.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public void Clear()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            this.Execute(DriverCommand.ClearElement, parameters);
        }

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
        public void SendKeys(string text)
        {
            if (text == null)
            {
                throw new ArgumentNullException("text", "text cannot be null");
            }

            if (this.driver.FileDetector.IsFile(text))
            {
                text = this.UploadFile(text);
            }

            // N.B. The Java remote server expects a CharSequence as the value input to
            // SendKeys. In JSON, these are serialized as an array of strings, with a
            // single character to each element of the array. Thus, we must use ToCharArray()
            // to get the same effect.
            // TODO: Remove either "keysToSend" or "value" property, whichever is not the
            // appropriate one for spec compliance.
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            if (this.driver.IsSpecificationCompliant)
            {
                parameters.Add("value", text.ToCharArray());
            }
            else
            {
                parameters.Add("value", new object[] { text });
            }

            this.Execute(DriverCommand.SendKeysToElement, parameters);
        }

        /// <summary>
        /// Submits this element to the web server.
        /// </summary>
        /// <remarks>If this current element is a form, or an element within a form,
        /// then this will be submitted to the web server. If this causes the current
        /// page to change, then this method will attempt to block until the new page
        /// is loaded.</remarks>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public void Submit()
        {
            if (this.driver.IsSpecificationCompliant)
            {
                IWebElement form = this.FindElement(By.XPath("./ancestor-or-self::form"));
                this.driver.ExecuteScript(
                    "var e = arguments[0].ownerDocument.createEvent('Event');" +
                    "e.initEvent('submit', true, true);" +
                    "if (arguments[0].dispatchEvent(e)) { arguments[0].submit(); }", form);
            }
            else
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", this.elementId);
                this.Execute(DriverCommand.SubmitElement, parameters);
            }
        }

        /// <summary>
        /// Clicks this element.
        /// </summary>
        /// <remarks>
        /// Click this element. If the click causes a new page to load, the <see cref="Click"/>
        /// method will attempt to block until the page has loaded. After calling the
        /// <see cref="Click"/> method, you should discard all references to this
        /// element unless you know that the element and the page will still be present.
        /// Otherwise, any further operations performed on this element will have an undefined
        /// behavior.
        /// </remarks>
        /// <exception cref="InvalidElementStateException">Thrown when the target element is not enabled.</exception>
        /// <exception cref="ElementNotVisibleException">Thrown when the target element is not visible.</exception>
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public void Click()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            this.Execute(DriverCommand.ClickElement, parameters);
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
        /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
        public string GetAttribute(string attributeName)
        {
            Response commandResponse = null;
            string attributeValue = string.Empty;
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            parameters.Add("name", attributeName);
            if (this.driver.IsSpecificationCompliant)
            {
                List<string> booleanAttributes = new List<string>()
                {
                    "default", "typemustmatch", "checked", "defer", "async", "muted",
                    "reversed", "required", "controls", "ismap", "disabled", "novalidate",
                    "readonly", "allowfullscreen", "selected", "formnovalidate",
                    "multiple", "autofocus", "open", "loop", "autoplay"
                };

                if (attributeName == "style")
                {
                    return this.driver.ExecuteScript("return arguments[0].style.cssText", this).ToString();
                }

                commandResponse = this.Execute(DriverCommand.GetElementProperty, parameters);
                if ((commandResponse.Value == null ||
                    ((commandResponse.Value.ToString() == string.Empty || commandResponse.Value.ToString() == bool.FalseString) && attributeName != "value")) ||
                    booleanAttributes.Contains(attributeName))
                {
                    commandResponse = this.Execute(DriverCommand.GetElementAttribute, parameters);
                }
            }
            else
            {
                commandResponse = this.Execute(DriverCommand.GetElementAttribute, parameters);
            }

            if (commandResponse.Value == null)
            {
                attributeValue = null;
            }
            else
            {
                attributeValue = commandResponse.Value.ToString();

                // Normalize string values of boolean results as lowercase.
                if (commandResponse.Value is bool)
                {
                    attributeValue = attributeValue.ToLowerInvariant();
                }
            }

            return attributeValue;
        }

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
        public string GetCssValue(string propertyName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);
            if (this.driver.IsSpecificationCompliant)
            {
                parameters.Add("name", propertyName);
            }
            else
            {
                parameters.Add("propertyName", propertyName);
            }

            Response commandResponse = this.Execute(DriverCommand.GetElementValueOfCssProperty, parameters);
            return commandResponse.Value.ToString();
        }

        /// <summary>
        /// Finds all <see cref="IWebElement">IWebElements</see> within the current context
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElements(this);
        }

        /// <summary>
        /// Finds the first <see cref="IWebElement"/> using the given method.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
        public IWebElement FindElement(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElement(this);
        }

        /// <summary>
        /// Finds the first of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element </param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementByLinkText("linktext")
        /// </code>
        /// </example>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return this.FindElement("link text", linkText);
        }

        /// <summary>
        /// Finds the first of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element </param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByLinkText("linktext")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return this.FindElements("link text", linkText);
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the element</param>
        /// <returns>IWebElement object so that you can interact with that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementById("id")
        /// </code>
        /// </example>
        public IWebElement FindElementById(string id)
        {
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", "#" + RemoteWebDriver.EscapeCssSelector(id));
            }

            return this.FindElement("id", id);
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the Element</param>
        /// <returns>ReadOnlyCollection of Elements that match the object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsById("id")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", "#" + RemoteWebDriver.EscapeCssSelector(id));
            }

            return this.FindElements("id", id);
        }

        /// <summary>
        /// Finds the first of elements that match the name supplied
        /// </summary>
        /// <param name="name">Name of the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// elem = driver.FindElementsByName("name")
        /// </code>
        /// </example>
        public IWebElement FindElementByName(string name)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", "*[name=\"" + name + "\"]");
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", "*[name=\"" + name + "\"]");
            }

            return this.FindElement("name", name);
        }

        /// <summary>
        /// Finds a list of elements that match the name supplied
        /// </summary>
        /// <param name="name">Name of element</param>
        /// <returns>ReadOnlyCollect of IWebElement objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByName("name")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", "*[name=\"" + name + "\"]");
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", "*[name=\"" + name + "\"]");
            }

            return this.FindElements("name", name);
        }

        /// <summary>
        /// Finds the first of elements that match the DOM Tag supplied
        /// </summary>
        /// <param name="tagName">tag name of the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementsByTagName("tag")
        /// </code>
        /// </example>
        public IWebElement FindElementByTagName(string tagName)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", tagName);
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", tagName);
            }

            return this.FindElement("tag name", tagName);
        }

        /// <summary>
        /// Finds a list of elements that match the DOM Tag supplied
        /// </summary>
        /// <param name="tagName">DOM Tag of the element on the page</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByTagName("tag")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", tagName);
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", tagName);
            }

            return this.FindElements("tag name", tagName);
        }

        /// <summary>
        /// Finds the first element in the page that matches the CSS Class supplied
        /// </summary>
        /// <param name="className">CSS class name of the element on the page</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementByClassName("classname")
        /// </code>
        /// </example>
        public IWebElement FindElementByClassName(string className)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", "." + className);
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", "." + RemoteWebDriver.EscapeCssSelector(className));
            }

            return this.FindElement("class name", className);
        }

        /// <summary>
        /// Finds a list of elements that match the class name supplied
        /// </summary>
        /// <param name="className">CSS class name of the elements on the page</param>
        /// <returns>ReadOnlyCollection of IWebElement object so that you can interact with those objects</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByClassName("classname")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", "." + className);
            if (this.driver.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", "." + RemoteWebDriver.EscapeCssSelector(className));
            }

            return this.FindElements("class name", className);
        }

        /// <summary>
        /// Finds the first of elements that match the XPath supplied
        /// </summary>
        /// <param name="xpath">xpath to the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementsByXPath("//table/tbody/tr/td/a");
        /// </code>
        /// </example>
        public IWebElement FindElementByXPath(string xpath)
        {
            return this.FindElement("xpath", xpath);
        }

        /// <summary>
        /// Finds a list of elements that match the XPath supplied
        /// </summary>
        /// <param name="xpath">xpath to element on the page</param>
        /// <returns>ReadOnlyCollection of IWebElement objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByXpath("//tr/td/a")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return this.FindElements("xpath", xpath);
        }

        /// <summary>
        /// Finds the first of elements that match the part of the link text supplied
        /// </summary>
        /// <param name="partialLinkText">part of the link text</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementsByPartialLinkText("partOfLink")
        /// </code>
        /// </example>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return this.FindElement("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds a list of elements that match the link text supplied
        /// </summary>
        /// <param name="partialLinkText">part of the link text</param>
        /// <returns>ReadOnlyCollection<![CDATA[<IWebElement>]]> objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByPartialLinkText("partOfTheLink")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return this.FindElements("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds the first element matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return this.FindElement("css selector", cssSelector);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return this.FindElements("css selector", cssSelector);
        }

        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of this element on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);

            // Get the screenshot as base64.
            Response screenshotResponse = this.Execute(DriverCommand.ElementScreenshot, parameters);
            string base64 = screenshotResponse.Value.ToString();

            // ... and convert it.
            return new Screenshot(base64);
        }

        /// <summary>
        /// Method to get the hash code of the element
        /// </summary>
        /// <returns>Integer of the hash code for the element</returns>
        public override int GetHashCode()
        {
            return this.elementId.GetHashCode();
        }

        /// <summary>
        /// Compares if two elements are equal
        /// </summary>
        /// <param name="obj">Object to compare against</param>
        /// <returns>A boolean if it is equal or not</returns>
        public override bool Equals(object obj)
        {
            IWebElement other = obj as IWebElement;
            if (other == null)
            {
                return false;
            }

            IWrapsElement objAsWrapsElement = obj as IWrapsElement;
            if (objAsWrapsElement != null)
            {
                other = objAsWrapsElement.WrappedElement;
            }

            RemoteWebElement otherAsElement = other as RemoteWebElement;
            if (otherAsElement == null)
            {
                return false;
            }

            if (this.elementId == otherAsElement.Id)
            {
                // For drivers that implement ID equality, we can check for equal IDs
                // here, and expect them to be equal. There is a potential danger here
                // where two different elements are assigned the same ID.
                return true;
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            parameters.Add("other", otherAsElement.Id);

            Response response = this.Execute(DriverCommand.ElementEquals, parameters);
            object value = response.Value;
            return value != null && value is bool && (bool)value;
        }

        /// <summary>
        /// Finds a child element matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the element.</param>
        /// <param name="value">The value to use to search for the element.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the given criteria.</returns>
        protected IWebElement FindElement(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindChildElement, parameters);
            return this.driver.GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds all child elements matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the elements.</param>
        /// <param name="value">The value to use to search for the elements.</param>
        /// <returns>A collection of all of the <see cref="IWebElement">IWebElements</see> matching the given criteria.</returns>
        protected ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.elementId);
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindChildElements, parameters);
            return this.driver.GetElementsFromResponse(commandResponse);
        }

        /// <summary>
        /// Executes a command on this element using the specified parameters.
        /// </summary>
        /// <param name="commandToExecute">The <see cref="DriverCommand"/> to execute against this element.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing names and values of the parameters for the command.</param>
        /// <returns>The <see cref="Response"/> object containing the result of the command execution.</returns>
        protected Response Execute(string commandToExecute, Dictionary<string, object> parameters)
        {
            return this.driver.InternalExecute(commandToExecute, parameters);
        }

        private string UploadFile(string localFile)
        {
            string base64zip = string.Empty;
            try
            {
                using (MemoryStream fileUploadMemoryStream = new MemoryStream())
                {
                    using (ZipStorer zipArchive = ZipStorer.Create(fileUploadMemoryStream, string.Empty))
                    {
                        string fileName = Path.GetFileName(localFile);
                        zipArchive.AddFile(ZipStorer.CompressionMethod.Deflate, localFile, fileName, string.Empty);
                        base64zip = Convert.ToBase64String(fileUploadMemoryStream.ToArray());
                    }
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("file", base64zip);
                Response response = this.Execute(DriverCommand.UploadFile, parameters);
                return response.Value.ToString();
            }
            catch (IOException e)
            {
                throw new WebDriverException("Cannot upload " + localFile, e);
            }
        }
    }
}
