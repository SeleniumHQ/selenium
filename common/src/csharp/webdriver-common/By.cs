using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Internal;
using System.Text.RegularExpressions;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    public class By
    {
        delegate IWebElement FindElementDelegate(ISearchContext context);
        delegate ReadOnlyCollection<IWebElement> FindElementsDelegate(ISearchContext context);

        FindElementDelegate findElement;
        FindElementsDelegate findElements;

        public static By Id(string idToFind) 
        {
            if (idToFind == null)
            {
                throw new ArgumentNullException("idToFind", "Cannot find elements with a null id attribute.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementById(idToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementsById(idToFind);
            };
            return by;
        }

        public static By LinkText(string linkTextToFind) 
        {
            if (linkTextToFind == null)
            {
                throw new ArgumentNullException("linkTextToFind", "Cannot find elements when link text is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementByLinkText(linkTextToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementsByLinkText(linkTextToFind);
            };
            return by;
        }

        public static By Name(string nameToFind)
        {
            if (nameToFind == null)
            {
                throw new ArgumentNullException("nameToFind", "Cannot find elements when name text is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementByName(nameToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementsByName(nameToFind);
            };
            return by;
        }

        public static By XPath(string xpathToFind)
        {
            if (xpathToFind == null)
            {
                throw new ArgumentNullException("xpathToFind", "Cannot find elements when the XPath expression is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementByXPath(xpathToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementsByXPath(xpathToFind);
            };
            return by;
        }

        public static By ClassName(string classNameToFind)
        {
            if (classNameToFind == null)
            {
                throw new ArgumentNullException("classNameToFind", "Cannot find elements when the class name expression is null.");
            }

            if (new Regex(".*\\s+.*").IsMatch(classNameToFind))
            {
                throw new IllegalLocatorException("Compound class names are not supported. Consider searching for one class name and filtering the results.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementByClassName(classNameToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementsByClassName(classNameToFind);
            };
            return by;
        }

        public static By PartialLinkText(string partialLinkTextToFind)
        {
            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementByPartialLinkText(partialLinkTextToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementsByPartialLinkText(partialLinkTextToFind);
            };
            return by;
        }

        public static By TagName(string tagNameToFind)
        {
            if (tagNameToFind == null)
            {
                throw new ArgumentNullException("tagNameToFind", "Cannot find elements when name tag name is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementByTagName(tagNameToFind);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementsByTagName(tagNameToFind);
            };
            return by;
        }

        //TODO(andre.nogueira) should accept Context - accepting IFindsById only for quick prototyping
        public IWebElement FindElement(ISearchContext context)
        {
            return findElement(context);
        }

        public ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            return findElements(context);
        }

    }
}
