using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to get elements off the page for test
    /// </summary>
    public class ChromeWebElement : IRenderedWebElement, ILocatable, IFindsByXPath, IFindsByLinkText, IFindsByPartialLinkText, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByCssSelector
    {
        private ChromeDriver parent;
        private string elementId;

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the ChromeWebElement class
        /// </summary>
        /// <param name="parent">Driver in use</param>
        /// <param name="elementId">Id of the element</param>
        public ChromeWebElement(ChromeDriver parent, string elementId)
        {
            this.parent = parent;
            this.elementId = elementId;
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets the Element Id
        /// </summary>
        public string ElementId
        {
            get { return elementId; }
        }

        /// <summary>
        /// Gets the location of the element
        /// </summary>
        public Point Location
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementLocation, elementId); 
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        /// <summary>
        /// Gets the size of the element
        /// </summary>
        public Size Size
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementSize, elementId);
                Dictionary<string, object> rawSize = (Dictionary<string, object>)commandResponse.Value;
                int width = Convert.ToInt32(rawSize["width"], CultureInfo.InvariantCulture);
                int height = Convert.ToInt32(rawSize["height"], CultureInfo.InvariantCulture);
                return new Size(width, height);
            }
        }

        /// <summary>
        /// Gets the DOM Tag name of the element
        /// </summary>
        public string TagName
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementTagName, elementId);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the Text of the element
        /// </summary>
        public string Text
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementText, elementId);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the Value of the Element
        /// </summary>
        public string Value
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementValue, elementId);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets a value indicating whether the element is enabled
        /// </summary>
        public bool Enabled
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.IsElementEnabled, elementId);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Gets a value indicating whether the element is selected
        /// </summary>
        public bool Selected
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.IsElementSelected, elementId);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Gets the point of the element once scrolling has completed
        /// </summary>
        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementLocationOnceScrolledIntoView, elementId);
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        /// <summary>
        /// Gets a value indicating whether the element is displayed
        /// </summary>
        public bool Displayed
        {
            get
            {
                ChromeResponse r = parent.Execute(DriverCommand.IsElementDisplayed, elementId);
                return (bool)r.Value;
            }
        }
        #endregion

        #region Methods
        /// <summary>
        /// Drag and drop by delta of pixels horizontally and vertically. Not Supported in Chrome Yet
        /// </summary>
        /// <param name="moveRightBy">Move right by x pixels</param>
        /// <param name="moveDownBy">Move down by x pixels</param>
        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

        /// <summary>
        /// Drag and Drop onto another element. Not Supported in Chrome yet
        /// </summary>
        /// <param name="element">Element to be dropped on</param>
        public void DragAndDropOn(IRenderedWebElement element)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

        /// <summary>
        /// Gets the Value of the CSS property
        /// </summary>
        /// <param name="propertyName">Css Property</param>
        /// <returns>Value of the CSS Property</returns>
        public string GetValueOfCssProperty(string propertyName)
        {
            ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementValueOfCssProperty, elementId, propertyName);
            return commandResponse.Value.ToString();
        }

        /// <summary>
        /// Clears the element
        /// </summary>
        public void Clear()
        {
            parent.Execute(DriverCommand.ClearElement, elementId);
        }

        /// <summary>
        /// Clicks on the element
        /// </summary>
        public void Click()
        {
            parent.Execute(DriverCommand.ClickElement, elementId);
        }

        /// <summary>
        /// Finds the element using the By Mechanism
        /// </summary>
        /// <param name="by">By Mechanism</param>
        /// <returns>A Web Element</returns>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        /// <summary>
        /// Finds the elements using the By Mechanism
        /// </summary>
        /// <param name="by">By Mechanism</param>
        /// <returns>A collection of Web Elements</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        /// <summary>
        /// Gets an attribute of the element
        /// </summary>
        /// <param name="attributeName">Attribute you want the value of</param>
        /// <returns>value of the attribute</returns>
        public string GetAttribute(string attributeName)
        {
            string attributeValue = null;
            object value = parent.Execute(DriverCommand.GetElementAttribute, elementId, attributeName).Value;
            if (value != null)
            {
                bool booleanValue = false;
                if (bool.TryParse(value.ToString(), out booleanValue))
                {
                    attributeValue = booleanValue.ToString().ToLowerInvariant();
                }
                else
                {
                    attributeValue = value.ToString();
                }
            }

            return attributeValue;
        }

        /// <summary>
        /// Sends keystrokes to the element
        /// </summary>
        /// <param name="text">Text to type</param>
        public void SendKeys(string text)
        {
            parent.Execute(DriverCommand.SendKeysToElement, elementId, text);
        }

        /// <summary>
        /// Selects the Element
        /// </summary>
        public void Select()
        {
            parent.Execute(DriverCommand.SetElementSelected, elementId);
        }

        /// <summary>
        /// Sends a submit message. This can be used on forms
        /// </summary>
        public void Submit()
        {
            parent.Execute(DriverCommand.SubmitElement, elementId);
        }

        /// <summary>
        /// Toggles the Element
        /// </summary>
        /// <returns>A value indicating whether it was toggled</returns>
        public bool Toggle()
        {
            ChromeResponse commandResponse = parent.Execute(DriverCommand.ToggleElement, elementId);
            return (bool)commandResponse.Value;
        }

        /// <summary>
        /// Finds an element by xpath
        /// </summary>
        /// <param name="xpath">xpath to element</param>
        /// <returns>The element found</returns>
        public IWebElement FindElementByXPath(string xpath)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "xpath", xpath));
        }

        /// <summary>
        /// Finds all elements that match the xpath
        /// </summary>
        /// <param name="xpath">Xpath to element</param>
        /// <returns>A collection of elements</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "xpath", xpath));
        }

        /// <summary>
        /// Finds the first element matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "link text", linkText));
        }

        /// <summary>
        /// Finds all elements matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "link text", linkText));
        }

        /// <summary>
        /// Finds the first element matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "partial link text", partialLinkText));
        }

        /// <summary>
        /// Finds all elements matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "partial link text", partialLinkText));
        }

        /// <summary>
        /// Finds the first element matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementById(string id)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "id", id));
        }

        /// <summary>
        /// Finds all elements matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "id", id));
        }

        /// <summary>
        /// Finds the first element matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByName(string name)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "name", name));
        }

        /// <summary>
        /// Finds all elements matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "name", name));
        }

        /// <summary>
        /// Finds the first element matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByTagName(string tagName)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "tag name", tagName));
        }

        /// <summary>
        /// Finds all elements matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "tag name", tagName));
        }

        /// <summary>
        /// Finds the first element matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByClassName(string className)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "class name", className));
        }

        /// <summary>
        /// Finds all elements matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "class name", className));
        }

        /// <summary>
        /// Finds the first element that matches the CSS Selector
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A Web Element</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "css", cssSelector));
        }

        /// <summary>
        /// Finds all the elements that match the CSS Selection
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A collection of elements that match</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "css", cssSelector));
        }

        /// <summary>
        /// Makes the mouse hover over the element
        /// </summary>
        public void Hover()
        {
            // Relies on the user not moving the mouse after the hover moves it into place 
            parent.Execute(DriverCommand.HoverOverElement, elementId);
        }

        /// <summary>
        /// Returns the HashCode of the Element
        /// </summary>
        /// <returns>Hashcode of the element</returns>
        public override int GetHashCode()
        {
            return elementId.GetHashCode();
        }

        /// <summary>
        /// Compares current element against another
        /// </summary>
        /// <param name="obj">element to compare against</param>
        /// <returns>A value indicating whether they are the same</returns>
        public override bool Equals(object obj)
        {
            IWebElement other = obj as IWebElement;
            if (other == null)
            {
                return false;
            }

            IWrapsElement elementWrapper = other as IWrapsElement;
            if (elementWrapper != null)
            {
                other = elementWrapper.WrappedElement;
            }

            ChromeWebElement otherChromeWebElement = other as ChromeWebElement;
            if (otherChromeWebElement == null)
            {
                return false;
            }

            return elementId.Equals(otherChromeWebElement.ElementId);
        }
        #endregion
    }
}
