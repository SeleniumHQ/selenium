using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Remote
{
    public class RemoteWebElement : IWebElement, ISearchContext, IFindsByLinkText, IFindsById, IFindsByName, IFindsByTagName, IFindsByClassName, IFindsByXPath, IFindsByPartialLinkText
    {
        RemoteWebDriver parentDriver;
        string elementId;

        public string Id
        {
            get { return elementId; }
            set { elementId = value; }
        }

        public RemoteWebDriver Parent
        {
            get { return parentDriver; }
            set { parentDriver = value; }
        }

        #region IWebElement Members

        public string TagName
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", elementId);
                Response commandResponse = parentDriver.Execute(DriverCommand.GetElementTagName, new object[] { parameters });
                return commandResponse.Value.ToString();
            }
        }

        public string Text
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", elementId);
                Response commandResponse = parentDriver.Execute(DriverCommand.GetElementText, new object[] { parameters });
                return commandResponse.Value.ToString();
            }
        }

        public string Value
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", elementId);
                Response commandResponse = parentDriver.Execute(DriverCommand.GetElementValue, new object[] { parameters });
                return commandResponse.Value.ToString();
            }
        }

        public bool Enabled
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", elementId);
                Response commandResponse = parentDriver.Execute(DriverCommand.IsElementEnabled, new object[] { parameters });
                return (bool)commandResponse.Value;
            }
        }

        public bool Selected
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", elementId);
                Response commandResponse = parentDriver.Execute(DriverCommand.IsElementSelected, new object[] { parameters });
                return (bool)commandResponse.Value;
            }
        }

        public void Select()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parentDriver.Execute(DriverCommand.SetElementSelected, new object[] { parameters });
        }

        public void Clear()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parentDriver.Execute(DriverCommand.ClearElement, new object[] { parameters });
        }

        public void SendKeys(string text)
        {
            // N.B. The Java remote server expects a CharSequence as the value input to
            // SendKeys. In JSON, these are serialized as an array of strings, with a
            // single character to each element of the array. Thus, we must use ToCharArray()
            // to get the same effect.
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("value", text.ToCharArray());
            parentDriver.Execute(DriverCommand.SendKeysToElement, new object[] { parameters });
        }

        public void Submit()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parentDriver.Execute(DriverCommand.SubmitElement, new object[] { parameters });
        }

        public void Click()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parentDriver.Execute(DriverCommand.ClickElement, new object[] { parameters });
        }

        public string GetAttribute(string attributeName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("name", attributeName);
            Response commandResponse = parentDriver.Execute(DriverCommand.GetElementAttribute, new object[] { parameters });
            string attributeValue = string.Empty;
            if (commandResponse.Value == null)
            {
                attributeValue = null;
            }
            else
            {
                attributeValue = commandResponse.Value.ToString();
            }
            return attributeValue;
        }

        public bool Toggle()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            Response commandResponse = parentDriver.Execute(DriverCommand.ToggleElement, new object[] { parameters });
            return (bool)commandResponse.Value;
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        #endregion

        #region IFindsByLinkText Members

        public IWebElement FindElementByLinkText(string linkText)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "link text");
            parameters.Add("value", linkText);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "link text");
            parameters.Add("value", linkText);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsById Members

        public IWebElement FindElementById(string id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "id");
            parameters.Add("value", id);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "id");
            parameters.Add("value", id);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByName Members

        public IWebElement FindElementByName(string name)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "name");
            parameters.Add("value", name);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "name");
            parameters.Add("value", name);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByTagName Members

        public IWebElement FindElementByTagName(string tagName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "tag name");
            parameters.Add("value", tagName);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "tag name");
            parameters.Add("value", tagName);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByClassName Members

        public IWebElement FindElementByClassName(string className)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "class name");
            parameters.Add("value", className);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "class name");
            parameters.Add("value", className);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByXPath Members

        public IWebElement FindElementByXPath(string xpath)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "xpath");
            parameters.Add("value", xpath);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "xpath");
            parameters.Add("value", xpath);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByPartialLinkText Members

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "partial link text");
            parameters.Add("value", partialLinkText);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElement, new object[] { parameters });
            return parentDriver.GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", elementId);
            parameters.Add("using", "partial link text");
            parameters.Add("value", partialLinkText);
            Response commandResponse = parentDriver.Execute(DriverCommand.FindChildElements, new object[] { parameters });
            return parentDriver.GetElementsFromResponse(commandResponse);
        }

        #endregion

        public override int GetHashCode()
        {
            return elementId.GetHashCode();
        }

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

            Dictionary<string, object> parameters = new Dictionary<string,object>();
            parameters.Add("id", elementId);
            parameters.Add("other", otherAsElement.Id);

            Response response = parentDriver.Execute(DriverCommand.ElementEquals, new object[] { parameters });
            object value = response.Value;
            return value != null && value is bool && (bool)value;
        }
    }
}
