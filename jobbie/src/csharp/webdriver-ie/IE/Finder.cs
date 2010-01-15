using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    internal class Finder : ISearchContext, IFindsById, IFindsByLinkText, IFindsByName, IFindsByPartialLinkText, IFindsByTagName, IFindsByXPath, IFindsByClassName //, IFindsByCssSelector
    {
        InternetExplorerDriver driver;
        SafeInternetExplorerWebElementHandle parent;
        SafeInternetExplorerDriverHandle handle;

        public Finder(InternetExplorerDriver driver, SafeInternetExplorerWebElementHandle parent)
        {
            this.driver = driver;
            if (parent != null)
            {
                this.parent = parent;
            }
            else
            {
                this.parent = new SafeInternetExplorerWebElementHandle();
            }
            handle = driver.GetUnderlayingHandle();
        }

        public IWebElement FindElementById(string id)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementById(handle, parent, id, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementById");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsById(handle, parent, id, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsById");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByLinkText(string linkText)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByLinkText(handle, parent, linkText, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByLinkText(handle, parent, linkText, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByLinkText");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByName(string name)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByName(handle, parent, name, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByName(handle, parent, name, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByXPath(string id)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByXPath(handle, parent, id, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByXPath");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByXPath(handle, parent, xpath, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByXPath");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByTagName(string tagName)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByTagName(handle, parent, tagName, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByTagName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByTagName(handle, parent, tagName, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByTagName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByPartialLinkText(handle, parent, partialLinkText, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByPartialLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByPartialLinkText(handle, parent, partialLinkText, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByPartialLinkText");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        public IWebElement FindElementByClassName(string className)
        {
            SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
            WebDriverResult result = NativeMethods.wdFindElementByClassName(handle, parent, className, ref rawElement);
            ResultHandler.VerifyResultCode(result, "FindElementByClassName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            SafeWebElementCollectionHandle collectionHandle = new SafeWebElementCollectionHandle();
            WebDriverResult result = NativeMethods.wdFindElementsByClassName(handle, parent, className, ref collectionHandle);
            ResultHandler.VerifyResultCode(result, "FindElementsByClassName");
            List<IWebElement> elementList = new List<IWebElement>();
            using (InternetExplorerWebElementCollection elements = new InternetExplorerWebElementCollection(driver, collectionHandle))
            {
                elementList = elements.ToList();
            }
            return new ReadOnlyCollection<IWebElement>(elementList);
        }

        //public IWebElement FindElementByCssSelector(string cssSelector)
        //{
        //    throw new NotImplementedException("CSS selector is not supported in IE");
        //}

        //public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        //{
        //    throw new NotImplementedException("CSS selector is not supported in IE");
        //}

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }
    }
}
