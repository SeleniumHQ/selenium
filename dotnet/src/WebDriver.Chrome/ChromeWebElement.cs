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
    public class ChromeWebElement : RenderedRemoteWebElement
    {
        #region Constructor
        /// <summary>
        /// Initializes a new instance of the ChromeWebElement class
        /// </summary>
        /// <param name="parent">Driver in use</param>
        /// <param name="elementId">Id of the element</param>
        public ChromeWebElement(ChromeDriver parent, string elementId)
            : base(parent, elementId)
        {
        }
        #endregion

        #region Overrides
        /// <summary>
        /// Returns the HashCode of the Element
        /// </summary>
        /// <returns>Hashcode of the element</returns>
        public override int GetHashCode()
        {
            return base.GetHashCode();
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

            return Id.Equals(otherChromeWebElement.Id);
        }
        #endregion
    }
}
