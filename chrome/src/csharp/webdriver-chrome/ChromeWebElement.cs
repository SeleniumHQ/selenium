using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;
using System.Globalization;

namespace OpenQA.Selenium.Chrome
{

    public class ChromeWebElement : IRenderedWebElement, ILocatable, IFindsByXPath, IFindsByLinkText, IFindsByPartialLinkText, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByCssSelector
    {
        private ChromeDriver parent;
        private string elementId;

        public ChromeWebElement(ChromeDriver parent, string elementId)
        {
            this.parent = parent;
            this.elementId = elementId;
        }

        public string ElementId
        {
            get { return elementId; }
        }

        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

        public void DragAndDropOn(IRenderedWebElement element)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

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

        public string GetValueOfCssProperty(string propertyName)
        {
            ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementValueOfCssProperty, elementId, propertyName);
            return commandResponse.Value.ToString();
        }

        public bool Displayed
        {
            get
            {
                ChromeResponse r = parent.Execute(DriverCommand.IsElementDisplayed, elementId);
                return (bool)r.Value;
            }
        }

        public void Clear()
        {
            parent.Execute(DriverCommand.ClearElement, elementId);
        }

        public void Click()
        {
            parent.Execute(DriverCommand.ClickElement, elementId);
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        public string GetAttribute(string name)
        {
            object value = parent.Execute(DriverCommand.GetElementAttribute, elementId, name).Value;
            return (value == null) ? null : value.ToString();
        }

        public string TagName
        {
            get 
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementTagName, elementId);
                return commandResponse.Value.ToString(); 
            }
        }

        public string Text
        {
            get 
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementText, elementId);
                return commandResponse.Value.ToString(); 
            }
        }

        public string Value
        {
            get 
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.GetElementValue, elementId);
                return commandResponse.Value.ToString(); 
            }
        }

        public bool Enabled
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.IsElementEnabled, elementId);
                return (bool)commandResponse.Value; 
            }
        }

        public bool Selected
        {
            get
            {
                ChromeResponse commandResponse = parent.Execute(DriverCommand.IsElementSelected, elementId);
                return (bool)commandResponse.Value;
            }
        }

        public void SendKeys(string text)
        {
            parent.Execute(DriverCommand.SendKeysToElement, elementId, text);
        }

        public void Select()
        {
            parent.Execute(DriverCommand.SetElementSelected, elementId);
        }

        public void Submit()
        {
            parent.Execute(DriverCommand.SubmitElement, elementId);
        }

        public bool Toggle()
        {
            ChromeResponse commandResponse = parent.Execute(DriverCommand.ToggleElement, elementId);
            return (bool)commandResponse.Value;
        }

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

        public IWebElement FindElementByXPath(string xpath)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "xpath", xpath));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "xpath", xpath));
        }

        public IWebElement FindElementByLinkText(string linkText)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "link text", linkText));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "link text", linkText));
        }

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "partial link text", partialLinkText));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "partial link text", partialLinkText));
        }

        public IWebElement FindElementById(string id)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "id", id));
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "id", id));
        }

        public IWebElement FindElementByName(string name)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "name", name));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "name", name));
        }

        public IWebElement FindElementByTagName(string tagName)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "tag name", tagName));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "tag name", tagName));
        }

        public IWebElement FindElementByClassName(string className)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "class name", className));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "class name", className));
        }

        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return parent.GetElementFrom(parent.Execute(DriverCommand.FindChildElement, elementId, "css", cssSelector));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return parent.GetElementsFrom(parent.Execute(DriverCommand.FindChildElements, elementId, "css", cssSelector));
        }

        public void Hover()
        {
            //Relies on the user not moving the mouse after the hover moves it into place 
            parent.Execute(DriverCommand.HoverOverElement, elementId);
        }

        public override int GetHashCode()
        {
            return elementId.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            if (!(obj is IWebElement))
            {
                return false;
            }

            IWebElement other = (IWebElement)obj;
            if (other is IWrapsElement)
            {
                other = ((IWrapsElement)obj).WrappedElement;
            }

            if (!(other is ChromeWebElement))
            {
                return false;
            }

            return elementId.Equals(((ChromeWebElement)other).elementId);
        }
    }
}
