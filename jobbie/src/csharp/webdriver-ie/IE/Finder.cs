using OpenQa.Selenium.IE;
using OpenQa.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQa.Selenium.IE
{
    class Finder : ISearchContext, IFindsById, IFindsByLinkText, IFindsByName, IFindsByPartialLinkText, IFindsByTagName, IFindsByXPath, IFindsByClassName
    {
        InternetExplorerDriver driver;
        ElementWrapper parent;
        SafeInternetExplorerDriverHandle handle;

        public Finder(InternetExplorerDriver driver, ElementWrapper parent)
        {
            this.driver = driver;
            if (parent != null)
            {
                this.parent = parent;
            }
            else
            {
                this.parent = new ElementWrapper();
            }
            handle = driver.GetUnderlayingHandle();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementById(SafeInternetExplorerDriverHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String id, ref ElementWrapper result);
        public IWebElement FindElementById(string id)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementById(handle, parent, id, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementById");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsById(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String id, ref IntPtr result);
        public List<IWebElement> FindElementsById(string id)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsById(handle, parent, id, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsById");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByLinkText(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String linkText, ref ElementWrapper result);
        public IWebElement FindElementByLinkText(string linkText)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByLinkText(handle, parent, linkText, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByLinkText(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String linkText, ref IntPtr result);
        public List<IWebElement> FindElementsByLinkText(string linkText)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByLinkText(handle, parent, linkText, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByLinkText");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String name, ref ElementWrapper result);
        public IWebElement FindElementByName(string name)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByName(handle, parent, name, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String name, ref IntPtr result);
        public List<IWebElement> FindElementsByName(string name)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByName(handle, parent, name, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByName");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByXPath(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String xpath, ref ElementWrapper result);
        public IWebElement FindElementByXPath(string id)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByXPath(handle, parent, id, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByXPath");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByXPath(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String xpath, ref IntPtr result);
        public List<IWebElement> FindElementsByXPath(string xpath)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByXPath(handle, parent, xpath, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByXPath");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByTagName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String linkText, ref ElementWrapper result);
        public IWebElement FindElementByTagName(string tagName)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByTagName(handle, parent, tagName, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByTagName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByTagName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String tagName, ref IntPtr result);
        public List<IWebElement> FindElementsByTagName(string tagName)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByTagName(handle, parent, tagName, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByTagName");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByPartialLinkText(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String linkText, ref ElementWrapper result);
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByPartialLinkText(handle, parent, partialLinkText, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByPartialLinkText");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByPartialLinkText(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String partialLinkText, ref IntPtr result);
        public List<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByPartialLinkText(handle, parent, partialLinkText, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByPartialLinkText");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementByClassName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String linkText, ref ElementWrapper result);
        public IWebElement FindElementByClassName(string className)
        {
            ElementWrapper rawElement = new ElementWrapper();
            int result = wdFindElementByClassName(handle, parent, className, ref rawElement);
            ErrorHandler.VerifyErrorCode(result, "FindElementByClassName");
            return new InternetExplorerWebElement(driver, rawElement);
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdFindElementsByClassName(SafeHandle driver, ElementWrapper element, [MarshalAs(UnmanagedType.LPWStr)] String className, ref IntPtr result);
        public List<IWebElement> FindElementsByClassName(string className)
        {
            IntPtr elements = IntPtr.Zero;
            int result = wdFindElementsByClassName(handle, parent, className, ref elements);
            ErrorHandler.VerifyErrorCode(result, "FindElementsByClassName");
            return new ElementCollection(driver, handle, elements).ToList();
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        public List<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

    }
}
