// <copyright file="WebElement.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Interactions.Internal;
using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace OpenQA.Selenium;

/// <summary>
/// A base class representing an HTML element on a page.
/// </summary>
public class WebElement : IWebElement, IFindsElement, IWrapsDriver, ILocatable, ITakesScreenshot, IWebDriverObjectReference
{
    /// <summary>
    /// The property name that represents a web element in the wire protocol.
    /// </summary>
    public const string ElementReferencePropertyName = "element-6066-11e4-a52e-4f735466cecf";

    private readonly WebDriver driver;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebElement"/> class.
    /// </summary>
    /// <param name="parentDriver">The <see cref="WebDriver"/> instance that is driving this element.</param>
    /// <param name="id">The ID value provided to identify the element.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="parentDriver"/> or <paramref name="id"/> are <see langword="null"/>.</exception>
    public WebElement(WebDriver parentDriver, string id)
    {
        this.driver = parentDriver ?? throw new ArgumentNullException(nameof(parentDriver));
        this.Id = id ?? throw new ArgumentNullException(nameof(id));
    }

    /// <summary>
    /// Gets the <see cref="IWebDriver"/> driving this element.
    /// </summary>
    public IWebDriver WrappedDriver => this.driver;

    /// <summary>
    /// Gets the tag name of this element.
    /// </summary>
    /// <remarks>
    /// The <see cref="TagName"/> property returns the tag name of the
    /// element, not the value of the name attribute. For example, it will return
    /// "input" for an element specified by the HTML markup &lt;input name="foo" /&gt;.
    /// </remarks>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual string TagName
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetElementTagName, parameters);

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
        }
    }

    /// <summary>
    /// Gets the innerText of this element, without any leading or trailing whitespace,
    /// and with other whitespace collapsed.
    /// </summary>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual string Text
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetElementText, parameters);

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
        }
    }

    /// <summary>
    /// Gets a value indicating whether or not this element is enabled.
    /// </summary>
    /// <remarks>The <see cref="Enabled"/> property will generally
    /// return <see langword="true"/> for everything except explicitly disabled input elements.</remarks>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual bool Enabled
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.IsElementEnabled, parameters);

            return Convert.ToBoolean(commandResponse.Value);
        }
    }

    /// <summary>
    /// Gets a value indicating whether or not this element is selected.
    /// </summary>
    /// <remarks>This operation only applies to input elements such as checkboxes,
    /// options in a select element and radio buttons.</remarks>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual bool Selected
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.IsElementSelected, parameters);

            return Convert.ToBoolean(commandResponse.Value);
        }
    }

    /// <summary>
    /// Gets a <see cref="Point"/> object containing the coordinates of the upper-left corner
    /// of this element relative to the upper-left corner of the page.
    /// </summary>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual Point Location
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetElementRect, parameters);

            if (commandResponse.Value is not Dictionary<string, object?> rawPoint)
            {
                throw new WebDriverException($"GetElementRect command was successful, but response was not an object: {commandResponse.Value}");
            }

            int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
            int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
            return new Point(x, y);
        }
    }

    /// <summary>
    /// Gets a <see cref="Size"/> object containing the height and width of this element.
    /// </summary>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual Size Size
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetElementRect, parameters);

            if (commandResponse.Value is not Dictionary<string, object?> rawSize)
            {
                throw new WebDriverException($"GetElementRect command was successful, but response was not an object: {commandResponse.Value}");
            }

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
    public virtual bool Displayed
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            string atom = GetAtom("is-displayed.js");
            parameters.Add("script", atom);
            parameters.Add("args", new object[] { ((IWebDriverObjectReference)this).ToDictionary() });

            Response commandResponse = Execute(DriverCommand.ExecuteScript, parameters);

            return Convert.ToBoolean(commandResponse.Value);
        }
    }

    /// <summary>
    /// Gets the point where the element would be when scrolled into view.
    /// </summary>
    public virtual Point LocationOnScreenOnceScrolledIntoView
    {
        get
        {
            object scriptResponse = this.driver.ExecuteScript("var rect = arguments[0].getBoundingClientRect(); return {'x': rect.left, 'y': rect.top};", this)!;

            Dictionary<string, object> rawLocation = (Dictionary<string, object>)scriptResponse;

            int x = Convert.ToInt32(rawLocation["x"], CultureInfo.InvariantCulture);
            int y = Convert.ToInt32(rawLocation["y"], CultureInfo.InvariantCulture);
            return new Point(x, y);
        }
    }

    /// <summary>
    /// Gets the computed accessible label of this element.
    /// </summary>
    public virtual string ComputedAccessibleLabel
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetComputedAccessibleLabel, parameters);

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
        }
    }

    /// <summary>
    /// Gets the computed ARIA role for this element.
    /// </summary>
    public virtual string ComputedAccessibleRole
    {
        get
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.Id);

            Response commandResponse = this.Execute(DriverCommand.GetComputedAccessibleRole, parameters);

#nullable disable
            // TODO: Returning this as a string is incorrect. The W3C WebDriver Specification
            // needs to be updated to more thoroughly document the structure of what is returned
            // by this command. Once that is done, a type-safe class will be created, and will
            // be returned by this property.
            return commandResponse.Value.ToString();
#nullable enable
        }
    }

    /// <summary>
    /// Gets the coordinates identifying the location of this element using
    /// various frames of reference.
    /// </summary>
    public virtual ICoordinates Coordinates => new ElementCoordinates(this);

    /// <summary>
    /// Gets the internal ID of the element.
    /// </summary>
    string IWebDriverObjectReference.ObjectReferenceId => this.Id;

    /// <summary>
    /// Gets the ID of the element
    /// </summary>
    /// <remarks>This property is internal to the WebDriver instance, and is
    /// not intended to be used in your code. The element's ID has no meaning
    /// outside of internal WebDriver usage, so it would be improper to scope
    /// it as public. However, both subclasses of <see cref="WebElement"/>
    /// and the parent driver hosting the element have a need to access the
    /// internal element ID. Therefore, we have two properties returning the
    /// same value, one scoped as internal, the other as protected.</remarks>
    protected string Id { get; }

    /// <summary>
    /// Clears the content of this element.
    /// </summary>
    /// <remarks>If this element is a text entry element, the <see cref="Clear"/>
    /// method will clear the value. It has no effect on other elements. Text entry elements
    /// are defined as elements with INPUT or TEXTAREA tags.</remarks>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual void Clear()
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);

        this.Execute(DriverCommand.ClearElement, parameters);
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
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual void Click()
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);

        this.Execute(DriverCommand.ClickElement, parameters);
    }

    /// <summary>
    /// Finds the first <see cref="IWebElement"/> using the given method.
    /// </summary>
    /// <param name="by">The locating mechanism to use.</param>
    /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="by"/> is <see langword="null"/>.</exception>
    /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
    public virtual IWebElement FindElement(By by)
    {
        if (by == null)
        {
            throw new ArgumentNullException(nameof(@by), "by cannot be null");
        }

        return by.FindElement(this);
    }

    /// <summary>
    /// Finds a child element matching the given mechanism and value.
    /// </summary>
    /// <param name="mechanism">The mechanism by which to find the element.</param>
    /// <param name="value">The value to use to search for the element.</param>
    /// <returns>The first <see cref="IWebElement"/> matching the given criteria.</returns>
    public virtual IWebElement FindElement(string mechanism, string value)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("using", mechanism);
        parameters.Add("value", value);

        Response commandResponse = this.Execute(DriverCommand.FindChildElement, parameters);

        return this.driver.GetElementFromResponse(commandResponse)!;
    }

    /// <summary>
    /// Finds all <see cref="IWebElement">IWebElements</see> within the current context
    /// using the given mechanism.
    /// </summary>
    /// <param name="by">The locating mechanism to use.</param>
    /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
    /// matching the current criteria, or an empty list if nothing matches.</returns>
    public virtual ReadOnlyCollection<IWebElement> FindElements(By by)
    {
        if (by == null)
        {
            throw new ArgumentNullException(nameof(@by), "by cannot be null");
        }

        return by.FindElements(this);
    }

    /// <summary>
    /// Finds all child elements matching the given mechanism and value.
    /// </summary>
    /// <param name="mechanism">The mechanism by which to find the elements.</param>
    /// <param name="value">The value to use to search for the elements.</param>
    /// <returns>A collection of all of the <see cref="IWebElement">IWebElements</see> matching the given criteria.</returns>
    public virtual ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("using", mechanism);
        parameters.Add("value", value);

        Response commandResponse = this.Execute(DriverCommand.FindChildElements, parameters);

        return this.driver.GetElementsFromResponse(commandResponse);
    }

    /// <summary>
    /// Gets the value of the specified attribute or property for this element.
    /// </summary>
    /// <param name="attributeName">The name of the attribute or property.</param>
    /// <returns>The attribute's or property's current value. Returns a <see langword="null"/>
    /// if the value is not set.</returns>
    /// <remarks>The <see cref="GetAttribute"/> method will return the current value
    /// of the attribute or property, even if the value has been modified after the page
    /// has been loaded. Note that the value of the following attributes will be returned
    /// even if there is no explicit attribute on the element:
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
    /// The method looks both in declared attributes in the HTML markup of the page, and
    /// in the properties of the element as found when accessing the element's properties
    /// via JavaScript.
    /// </remarks>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual string? GetAttribute(string attributeName)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        string atom = GetAtom("get-attribute.js");
        parameters.Add("script", atom);
        parameters.Add("args", new object[] { ((IWebDriverObjectReference)this).ToDictionary(), attributeName });

        Response commandResponse = Execute(DriverCommand.ExecuteScript, parameters);


        // Normalize string values of boolean results as lowercase.
        if (commandResponse.Value is bool b)
        {
            return b ? "true" : "false";
        }

        return commandResponse.Value?.ToString();
    }

    /// <summary>
    /// Gets the value of a declared HTML attribute of this element.
    /// </summary>
    /// <param name="attributeName">The name of the HTML attribute to get the value of.</param>
    /// <returns>The HTML attribute's current value. Returns a <see langword="null"/> if the
    /// value is not set or the declared attribute does not exist.</returns>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    /// <remarks>
    /// As opposed to the <see cref="GetAttribute(string)"/> method, this method
    /// only returns attributes declared in the element's HTML markup. To access the value
    /// of an IDL property of the element, either use the <see cref="GetAttribute(string)"/>
    /// method or the <see cref="GetDomProperty(string)"/> method.
    /// </remarks>
    public virtual string? GetDomAttribute(string attributeName)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("name", attributeName);

        Response commandResponse = this.Execute(DriverCommand.GetElementAttribute, parameters);

        return commandResponse.Value?.ToString();
    }

    /// <summary>
    /// Gets the value of a JavaScript property of this element.
    /// </summary>
    /// <param name="propertyName">The name of the JavaScript property to get the value of.</param>
    /// <returns>The JavaScript property's current value. Returns a <see langword="null"/> if the
    /// value is not set or the property does not exist.</returns>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual string? GetDomProperty(string propertyName)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("name", propertyName);

        Response commandResponse = this.Execute(DriverCommand.GetElementProperty, parameters);

        return commandResponse.Value?.ToString();
    }

    /// <summary>
    /// Gets the representation of an element's shadow root for accessing the shadow DOM of a web component.
    /// </summary>
    /// <returns>A shadow root representation.</returns>
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    /// <exception cref="NoSuchShadowRootException">Thrown when this element does not have a shadow root.</exception>
    public virtual ISearchContext GetShadowRoot()
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);

        Response commandResponse = this.Execute(DriverCommand.GetElementShadowRoot, parameters);
        if (commandResponse.Value is not Dictionary<string, object?> shadowRootDictionary)
        {
            throw new WebDriverException("Get shadow root command succeeded, but response value does not represent a shadow root.");
        }

        if (!ShadowRoot.TryCreate(this.driver, shadowRootDictionary, out ShadowRoot? shadowRoot))
        {
            throw new WebDriverException("Get shadow root command succeeded, but response value does not have a shadow root key value.");
        }

        return shadowRoot;
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
    public virtual string GetCssValue(string propertyName)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("name", propertyName);

        Response commandResponse = this.Execute(DriverCommand.GetElementValueOfCssProperty, parameters);

        commandResponse.EnsureValueIsNotNull();
        return commandResponse.Value.ToString()!;
    }

    /// <summary>
    /// Gets a <see cref="Screenshot"/> object representing the image of this element on the screen.
    /// </summary>
    /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
    public virtual Screenshot GetScreenshot()
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);

        // Get the screenshot as base64.
        Response screenshotResponse = this.Execute(DriverCommand.ElementScreenshot, parameters);

        screenshotResponse.EnsureValueIsNotNull();
        string base64 = screenshotResponse.Value.ToString()!;

        // ... and convert it.
        return new Screenshot(base64);
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
    /// <exception cref="StaleElementReferenceException">Thrown when the target element is no longer valid in the document DOM.</exception>
    public virtual void SendKeys(string text)
    {
        if (text == null)
        {
            throw new ArgumentNullException(nameof(text), "text cannot be null");
        }

        var fileNames = text.Split('\n');
        if (fileNames.All(this.driver.FileDetector.IsFile))
        {
            var uploadResults = new List<string>();
            foreach (var fileName in fileNames)
            {
                uploadResults.Add(this.UploadFile(fileName));
            }
            text = string.Join("\n", uploadResults);
        }

        // N.B. The Java remote server expects a CharSequence as the value input to
        // SendKeys. In JSON, these are serialized as an array of strings, with a
        // single character to each element of the array. Thus, we must use ToCharArray()
        // to get the same effect.
        // TODO: Remove either "keysToSend" or "value" property, whichever is not the
        // appropriate one for spec compliance.
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("id", this.Id);
        parameters.Add("text", text);
        parameters.Add("value", text.ToCharArray());

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
    public virtual void Submit()
    {
        string? elementType = this.GetAttribute("type");
        if (elementType != null && elementType == "submit")
        {
            this.Click();
        }
        else
        {
            string script = "/* submitForm */var form = arguments[0];\n" +
                            "while (form.nodeName != \"FORM\" && form.parentNode) {\n" +
                            "  form = form.parentNode;\n" +
                            "}\n" +
                            "if (!form) { throw Error('Unable to find containing form element'); }\n" +
                            "if (!form.ownerDocument) { throw Error('Unable to find owning document'); }\n" +
                            "var e = form.ownerDocument.createEvent('Event');\n" +
                            "e.initEvent('submit', true, true);\n" +
                            "if (form.dispatchEvent(e)) { HTMLFormElement.prototype.submit.call(form) }\n";

            this.driver.ExecuteScript(script, this);
        }
    }

    /// <summary>
    /// Returns a string that represents the current <see cref="WebElement"/>.
    /// </summary>
    /// <returns>A string that represents the current <see cref="WebElement"/>.</returns>
    public override string ToString()
    {
        return string.Format(CultureInfo.InvariantCulture, "Element (id = {0})", this.Id);
    }

    /// <summary>
    /// Method to get the hash code of the element
    /// </summary>
    /// <returns>Integer of the hash code for the element</returns>
    public override int GetHashCode()
    {
        return this.Id.GetHashCode();
    }

    /// <summary>
    /// Compares if two elements are equal
    /// </summary>
    /// <param name="obj">Object to compare against</param>
    /// <returns>A boolean if it is equal or not</returns>
    public override bool Equals(object? obj)
    {
        if (obj is not IWebElement other)
        {
            return false;
        }

        if (obj is IWrapsElement objAsWrapsElement)
        {
            other = objAsWrapsElement.WrappedElement;
        }

        if (other is not WebElement otherAsElement)
        {
            return false;
        }

        if (this.Id == otherAsElement.Id)
        {
            // For drivers that implement ID equality, we can check for equal IDs
            // here, and expect them to be equal. There is a potential danger here
            // where two different elements are assigned the same ID.
            return true;
        }

        return false;
    }

    Dictionary<string, object> IWebDriverObjectReference.ToDictionary()
    {
        Dictionary<string, object> elementDictionary = new Dictionary<string, object>();
        elementDictionary.Add(ElementReferencePropertyName, this.Id);
        return elementDictionary;
    }

    /// <summary>
    /// Executes a command on this element using the specified parameters.
    /// </summary>
    /// <param name="commandToExecute">The <see cref="DriverCommand"/> to execute against this element.</param>
    /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing names and values of the parameters for the command.</param>
    /// <returns>The <see cref="Response"/> object containing the result of the command execution.</returns>
    protected virtual Response Execute(string commandToExecute, Dictionary<string,
#nullable disable
        object
#nullable enable
            >? parameters)
    {
        return this.driver.Execute(commandToExecute, parameters);
    }

    private static string GetAtom(string atomResourceName)
    {
        string atom;
        using (Stream atomStream = ResourceUtilities.GetResourceStream(atomResourceName, atomResourceName))
        {
            using (StreamReader atomReader = new StreamReader(atomStream))
            {
                atom = atomReader.ReadToEnd();
            }
        }

        string atomName = atomResourceName.Replace(".js", "");
        string wrappedAtom = string.Format(CultureInfo.InvariantCulture, "/* {0} */return ({1}).apply(null, arguments);", atomName, atom);
        return wrappedAtom;
    }

    private string UploadFile(string localFile)
    {
        string base64zip;
        try
        {
            using (MemoryStream fileUploadMemoryStream = new MemoryStream())
            {
                using (ZipArchive zipArchive = new ZipArchive(fileUploadMemoryStream, ZipArchiveMode.Create))
                {
                    string fileName = Path.GetFileName(localFile);
                    zipArchive.CreateEntryFromFile(localFile, fileName);
                }
                base64zip = Convert.ToBase64String(fileUploadMemoryStream.ToArray());
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("file", base64zip);
            Response response = this.Execute(DriverCommand.UploadFile, parameters);

            response.EnsureValueIsNotNull();
            return response.Value.ToString()!;
        }
        catch (IOException e)
        {
            throw new WebDriverException("Cannot upload " + localFile, e);
        }
    }
}
