/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism by which to find elements within a document.
    /// </summary>
    /// <remarks>It is possible to create your own locating mechanisms for finding documents.
    /// In order to do this,subclass this class and override the protected methods. However,
    /// it is expected that that all subclasses rely on the basic finding mechanisms provided 
    /// through static methods of this class.
    /// </remarks>
    /// <example>This example shows a subclass for finding by name or by id.
    /// <code>
    /// public class FindByIdOrName
    /// {
    ///     private string selector;
    /// <para></para>     
    ///     public FindByIdOrName(string idOrNameSelector) 
    ///     {
    ///         selector = idOrNameSelector;
    ///     }
    /// <para></para>    
    ///     public IWebElement FindElement(IWebDriver driver) 
    ///     {
    ///         IWebElement element = driver.FindElement(By.Id(selector)); 
    ///         if (element == null)
    ///         {
    ///             element = driver.FindElement(By.Name(selector); 
    ///         }
    ///         return element;
    ///     }
    /// }
    /// </code>
    /// </example>
    public class By
    {
        private FindElementDelegate findElementMethod;
        private FindElementsDelegate findElementsMethod;

        private delegate IWebElement FindElementDelegate(ISearchContext context);
        
        private delegate ReadOnlyCollection<IWebElement> FindElementsDelegate(ISearchContext context);

        /// <summary>
        /// Gets a mechanism to find elements by their ID.
        /// </summary>
        /// <param name="idToFind">The ID to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By Id(string idToFind) 
        {
            if (idToFind == null)
            {
                throw new ArgumentNullException("idToFind", "Cannot find elements with a null id attribute.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementById(idToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsById)context).FindElementsById(idToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by their link text.
        /// </summary>
        /// <param name="linkTextToFind">The link text to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By LinkText(string linkTextToFind) 
        {
            if (linkTextToFind == null)
            {
                throw new ArgumentNullException("linkTextToFind", "Cannot find elements when link text is null.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementByLinkText(linkTextToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByLinkText)context).FindElementsByLinkText(linkTextToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by their name.
        /// </summary>
        /// <param name="nameToFind">The name to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By Name(string nameToFind)
        {
            if (nameToFind == null)
            {
                throw new ArgumentNullException("nameToFind", "Cannot find elements when name text is null.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementByName(nameToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByName)context).FindElementsByName(nameToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by an XPath query.
        /// </summary>
        /// <param name="xpathToFind">The XPath query to use.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By XPath(string xpathToFind)
        {
            if (xpathToFind == null)
            {
                throw new ArgumentNullException("xpathToFind", "Cannot find elements when the XPath expression is null.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementByXPath(xpathToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByXPath)context).FindElementsByXPath(xpathToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by their CSS class.
        /// </summary>
        /// <param name="classNameToFind">The CSS class to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        /// <remarks>If an element has many classes then this will match against each of them.
        /// For example if the value is "one two onone", then the following values for the 
        /// className parameter will match: "one" and "two".</remarks>
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
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementByClassName(classNameToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByClassName)context).FindElementsByClassName(classNameToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by a partial match on their link text.
        /// </summary>
        /// <param name="partialLinkTextToFind">The partial link text to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By PartialLinkText(string partialLinkTextToFind)
        {
            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementByPartialLinkText(partialLinkTextToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByPartialLinkText)context).FindElementsByPartialLinkText(partialLinkTextToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by their tag name.
        /// </summary>
        /// <param name="tagNameToFind">The tag name to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By TagName(string tagNameToFind)
        {
            if (tagNameToFind == null)
            {
                throw new ArgumentNullException("tagNameToFind", "Cannot find elements when name tag name is null.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementByTagName(tagNameToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByTagName)context).FindElementsByTagName(tagNameToFind);
            };
            return by;
        }

        /// <summary>
        /// Gets a mechanism to find elements by their cascading stylesheet (CSS) selector.
        /// </summary>
        /// <param name="cssSelectorToFind">The CSS selector to find.</param>
        /// <returns>A <see cref="By"/> object the driver can use to find the elements.</returns>
        public static By CssSelector(string cssSelectorToFind)
        {
            if (cssSelectorToFind == null)
            {
                throw new ArgumentNullException("cssSelectorToFind", "Cannot find elements when name CSS selector is null.");
            }

            By by = new By();
            by.findElementMethod = delegate(ISearchContext context)
            {
                return ((IFindsByCssSelector)context).FindElementByCssSelector(cssSelectorToFind);
            };
            by.findElementsMethod = delegate(ISearchContext context)
            {
                return ((IFindsByCssSelector)context).FindElementsByCssSelector(cssSelectorToFind);
            };
            return by;
        }

        /// <summary>
        /// Finds the first element matching the criteria.
        /// </summary>
        /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        public IWebElement FindElement(ISearchContext context)
        {
            return findElementMethod(context);
        }

        /// <summary>
        /// Finds all elements matching the criteria.
        /// </summary>
        /// <param name="context">An <see cref="ISearchContext"/> object to use to search for the elements.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            return findElementsMethod(context);
        }
    }
}
