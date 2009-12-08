using System;
using System.Collections.Generic;
using System.Text;
using OpenQa.Selenium.Internal;
using System.Text.RegularExpressions;

namespace OpenQa.Selenium
{
    public class By
    {

        delegate IWebElement findElementDelegate(ISearchContext context);
        delegate List<IWebElement> findElementsDelegate(ISearchContext context);

        findElementDelegate findElement;
        findElementsDelegate findElements;

        public static By Id(string id) 
        {
            if (id == null)
            {
                throw new ArgumentNullException("Cannot find elements with a null id attribute.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementById(id);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementsById(id);
            };
            return by;
        }

        public static By LinkText(string linkText) 
        {
            if (linkText == null)
            {
                throw new ArgumentNullException("Cannot find elements when link text is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementByLinkText(linkText);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementsByLinkText(linkText);
            };
            return by;
        }

        public static By Name(string name)
        {
            if (name == null)
            {
                throw new ArgumentNullException("Cannot find elements when name text is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementByName(name);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementsByName(name);
            };
            return by;
        }

        public static By XPath(string xpath)
        {
            if (xpath == null)
            {
                throw new ArgumentNullException("Cannot find elements when the XPath expression is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementByXPath(xpath);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementsByXPath(xpath);
            };
            return by;
        }

        public static By ClassName(string className)
        {
            if (className == null)
            {
                throw new ArgumentNullException("Cannot find elements when the class name expression is null.");
            }

            if (new Regex(".*\\s+.*").IsMatch(className))
            {
                throw new IllegalLocatorException("Compound class names are not supported. Consider searching for one class name and filtering the results.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementByClassName(className);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementsByClassName(className);
            };
            return by;
        }

        public static By PartialLinkText(string partialLinkText)
        {
            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementByPartialLinkText(partialLinkText);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementsByPartialLinkText(partialLinkText);
            };
            return by;
        }

        public static By TagName(string tagName)
        {
            if (tagName == null)
            {
                throw new ArgumentNullException("Cannot find elements when name tag name is null.");
            }

            By by = new By();
            by.findElement = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementByTagName(tagName);
            };
            by.findElements = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementsByTagName(tagName);
            };
            return by;
        }

        //TODO(andre.nogueira) should accept Context - accepting IFindsById only for quick prototyping
        public IWebElement FindElement(ISearchContext context)
        {
            return findElement(context);
        }

        public List<IWebElement> FindElements(ISearchContext context)
        {
            return findElements(context);
        }

    }
}
