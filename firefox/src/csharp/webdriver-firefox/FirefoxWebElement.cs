using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;
using System.Drawing;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    public class FirefoxWebElement : IRenderedWebElement, ILocatable, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByLinkText, IFindsByPartialLinkText, IFindsByXPath
    {
        private FirefoxDriver parentDriver;
        private string elementId;

        public FirefoxWebElement(FirefoxDriver driver, string id)
        {
            parentDriver = driver;
            elementId = id;
        }

        public string ElementId
        {
            get { return elementId; }
        }

        #region IWebElement Members

        public string TagName
        {
            get
            {
                string name = SendMessage(typeof(WebDriverException), "getTagName");
                return name;
            }
        }

        public string Text
        {
            get
            {
                string elementText = SendMessage(typeof(WebDriverException), "getText");
                return elementText;
            }
        }

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

        public bool Enabled
        {
            get
            {
                string value = GetAttribute("disabled");
                return !bool.Parse(value);
            }
        }

        public bool Selected
        {
            get
            {
                string value = SendMessage(typeof(WebDriverException), "isSelected");
                return bool.Parse(value);
            }
        }

        public void Clear()
        {
            SendMessage(typeof(NotSupportedException), "clear");
        }

        public void SendKeys(string text)
        {
            SendMessage(typeof(NotSupportedException), "sendKeys", new object[] { text.ToCharArray() });
        }

        public void Submit()
        {
            SendMessage(typeof(WebDriverException), "submit");
        }

        public void Click()
        {
            SendMessage(typeof(NotSupportedException), "click"); ;
        }

        public void Select()
        {
            SendMessage(typeof(NotSupportedException), "setSelected");
        }

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
                    attributeValue = result.ToString().ToLower();
                }
                else
                {
                    attributeValue = result.ToString();
                }
            }

            return attributeValue;
        }

        public bool Toggle()
        {
            SendMessage(typeof(NotImplementedException), "toggle");
            return Selected;
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        #endregion

        #region IRenderedWebElement Members

        public Point Location
        {
            get
            {
                Point locationPoint = new Point();
                object result = ExecuteCommand(typeof(WebDriverException), "getLocation", null);
                Dictionary<string, object> locationObject = result as Dictionary<string, object>;
                if (locationObject != null)
                {
                    locationPoint = new Point(int.Parse(locationObject["x"].ToString()), int.Parse(locationObject["y"].ToString()));
                }
                return locationPoint;
            }
        }

        public Size Size
        {
            get
            {
                System.Drawing.Size elementSize = new Size();
                object result = ExecuteCommand(typeof(WebDriverException), "getSize", null);
                Dictionary<string, object> sizeObject = result as Dictionary<string, object>;
                if (sizeObject != null)
                {
                    elementSize = new Size(int.Parse(sizeObject["width"].ToString()), int.Parse(sizeObject["height"].ToString()));
                }
                return elementSize;
            }
        }

        public bool Displayed
        {
            get
            {
                string elementIsDisplayed = SendMessage(typeof(WebDriverException), "isDisplayed");
                return bool.Parse(elementIsDisplayed);
            }
        }

        public string GetValueOfCssProperty(string propertyName)
        {
            return SendMessage(typeof(WebDriverException), "getValueOfCssProperty", new object[] { propertyName });
        }

        public void Hover()
        {
            SendMessage(typeof(WebDriverException), "hover");
        }

        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            SendMessage(typeof(NotSupportedException), "dragElement", new object[] { moveRightBy, moveDownBy });
        }

        public void DragAndDropOn(IRenderedWebElement element)
        {
            Point currentLocation = Location;
            Point destination = element.Location;
            DragAndDropBy(destination.X - currentLocation.X, destination.Y - currentLocation.Y);
        }

        #endregion

        #region ILocatable Members

        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                try
                {
                    Point locationPoint = new Point();
                    object result = ExecuteCommand(typeof(WebDriverException), "getLocationOnceScrolledIntoView", null);
                    Dictionary<string, object> locationObject = result as Dictionary<string, object>;
                    if (locationObject != null)
                    {
                        locationPoint = new Point(int.Parse(locationObject["x"].ToString()), int.Parse(locationObject["y"].ToString()));
                    }

                    return locationPoint;
                }
                catch (Exception e)
                {
                    throw new WebDriverException("", e);
                }
            }
        }

        #endregion

        #region IFindsById Members

        public IWebElement FindElementById(string id)
        {
            return FindChildElement("id", id);
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return FindChildElements("id", id);
        }

        #endregion

        #region IFindsByName Members

        public IWebElement FindElementByName(string name)
        {
            return FindChildElement("name", name);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return FindChildElements("name", name);
        }

        #endregion

        #region IFindsByTagName Members

        public IWebElement FindElementByTagName(string tagName)
        {
            return FindChildElement("tag name", tagName);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return FindChildElements("tag name", tagName);
        }

        #endregion

        #region IFindsByClassName Members

        public IWebElement FindElementByClassName(string className)
        {
            return FindChildElement("class name", className);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            return FindChildElements("class name", className);
        }

        #endregion

        #region IFindsByLinkText Members

        public IWebElement FindElementByLinkText(string linkText)
        {
            return FindChildElement("link text", linkText);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return FindChildElements("link text", linkText);
        }

        #endregion

        #region IFindsByPartialLinkText Members

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return FindChildElement("partial link text", partialLinkText);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return FindChildElements("partial link text", partialLinkText);
        }

        #endregion

        #region IFindsByXPath Members

        public IWebElement FindElementByXPath(string xpath)
        {
            return FindChildElement("xpath", xpath);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return FindChildElements("xpath", xpath);
        }

        #endregion

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

            if (!(other is FirefoxWebElement))
            {
                return false;
            }
            return elementId == ((FirefoxWebElement)other).ElementId;
        }

        public override int GetHashCode()
        {
            return elementId.GetHashCode();
        }

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
                throw new WebDriverException("", e);
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
    }
}
