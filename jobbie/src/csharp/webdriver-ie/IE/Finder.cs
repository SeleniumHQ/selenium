using System.Collections.Generic;
using System.Collections.ObjectModel;

using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Wrapper class for finding elements
    /// </summary>
    internal class Finder : ISearchContext, IFindsById, IFindsByLinkText, IFindsByName, IFindsByPartialLinkText, IFindsByTagName, IFindsByXPath, IFindsByClassName // , IFindsByCssSelector
    {
        private InternetExplorerDriver driver;
        private SafeInternetExplorerWebElementHandle parent;
        private SafeInternetExplorerDriverHandle handle;

        /// <summary>
        /// Initializes a new instance of the Finder class.
        /// </summary>
        /// <param name="driver">InternetExplorerDriver in use</param>
        /// <param name="parent">ElementHandle to for use with the Native methods</param>
        public Finder(InternetExplorerDriver driver, SafeInternetExplorerWebElementHandle parent)
        {
            this.driver = driver;
            this.parent = parent;
            handle = driver.GetUnderlayingHandle();
        }

        /// <summary>
        /// Find the first element that has this ID
        /// </summary>
        /// <param name="id">ID of web element on the page</param>
        /// <returns>Returns a IWebElement to use</returns>
        public IWebElement FindElementById(string id)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementById(handle, parent, id, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementById");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the Element</param>
        /// <returns>ReadOnlyCollection of Elements that match the object so that you can interact that object</returns>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsById(handle, parent, id, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsById");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Finds the first of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element </param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByLinkText(string linkText)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByLinkText(handle, parent, linkText, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Finds a list of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element</param>
        /// <returns>ReadOnlyCollection of IWebElement object so that you can interact with those objects</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByLinkText(handle, parent, linkText, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByLinkText");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Find the first element that matches by name
        /// </summary>
        /// <param name="name">Name of the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByName(string name)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByName(handle, parent, name, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Find all the elements that match the name
        /// </summary>
        /// <param name="name">Name of element on the page</param>
        /// <returns>ReadOnlyCollection ofIWebElement object so that you can interact that object</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByName(handle, parent, name, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Find the first element that matches the XPath
        /// </summary>
        /// <param name="xpath">XPath to the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByXPath(string xpath)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByXPath(handle, parent, xpath, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByXPath");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Find all the elements taht match the XPath
        /// </summary>
        /// <param name="xpath">XPath to the element</param>
        /// <returns>ReadOnlyCollection of IWebElement object so that you can interact that object</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByXPath(handle, parent, xpath, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByXPath");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Find the first element that matches the tag
        /// </summary>
        /// <param name="tagName">tagName of element on the page</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByTagName(string tagName)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByTagName(handle, parent, tagName, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByTagName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Find all elements that match the tag
        /// </summary>
        /// <param name="tagName">tagName of element on the page</param>
        /// <returns>ReadOnlyCollection of IWebElement object so that you can interact that object</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByTagName(handle, parent, tagName, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByTagName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Find the first element that matches part of the text
        /// </summary>
        /// <param name="partialLinkText">text to be use</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByPartialLinkText(handle, parent, partialLinkText, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByPartialLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Method to return all elements that match the link text passed in
        /// </summary>
        /// <param name="partialLinkText">Text to search for</param>
        /// <returns>Returns a ReadOnlyCollection of IWebElements so you can interact with that object</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByPartialLinkText(handle, parent, partialLinkText, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByPartialLinkText");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /// <summary>
        /// Method to return the first element that matches the CSS class passed in
        /// </summary>
        /// <param name="className">CSS class name</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElementByClassName(string className)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementByClassName(handle, parent, className, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByClassName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        /// <summary>
        /// Method to find all the elements on the page that match the CSS Classname
        /// </summary>
        /// <param name="className"> CSS Class you wish to find</param>
        /// <returns>ReadOnlyCollection of IWebElement objects so that you can interact those objects</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.FindElementsByClassName(handle, parent, className, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByClassName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }

            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        /*public IWebElement FindElementByCssSelector(string cssSelector)
        *{
        *    throw new NotImplementedException("CSS selector is not supported in IE");
        *}
         */

        /*public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        *{
        *    throw new NotImplementedException("CSS selector is not supported in IE");
        *}
         */

        /// <summary>
        /// Find the first element that matches the By mechanism
        /// </summary>
        /// <param name="by">By mechanism</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        /// <summary>
        /// Find all Elements that match the By mechanism
        /// </summary>
        /// <param name="by">By mechanism</param>
        /// <returns>ReadOnlyCollection of IWebElement objects so that you can interact those objects</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }
    }
}
