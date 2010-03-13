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
    public class ChromeWebElement : RenderedRemoteWebElement, ILocatable, IFindsByCssSelector
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

        #region ILocatable Members
        /// <summary>
        /// Gets the point of the element once scrolling has completed
        /// </summary>
        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Execute(DriverCommand.GetElementLocationOnceScrolledIntoView, parameters);
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }
        #endregion

        /// <summary>
        /// Drag and drop by delta of pixels horizontally and vertically. Not Supported in Chrome Yet
        /// </summary>
        /// <param name="moveRightBy">Move right by x pixels</param>
        /// <param name="moveDownBy">Move down by x pixels</param>
        public override void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

        /// <summary>
        /// Drag and Drop onto another element. Not Supported in Chrome yet
        /// </summary>
        /// <param name="element">Element to be dropped on</param>
        public override void DragAndDropOn(IRenderedWebElement element)
        {
            throw new NotImplementedException("Not yet supported in Chrome");
        }

        #region IFindsByCssSelector Members
        /// <summary>
        /// Finds the first element that matches the CSS Selector
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A Web Element</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return FindElement("css", cssSelector);
        }

        /// <summary>
        /// Finds all the elements that match the CSS Selection
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A collection of elements that match</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return FindElements("css", cssSelector);
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
