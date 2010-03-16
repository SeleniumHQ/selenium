using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism to find Rendered Elements on the page
    /// </summary>
    public class RenderedRemoteWebElement : RemoteWebElement, IRenderedWebElement
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RenderedRemoteWebElement"/> class.
        /// </summary>
        /// <param name="parent">The <see cref="RemoteWebDriver"/> instance hosting this element.</param>
        /// <param name="id">The ID assigned to the element.</param>
        public RenderedRemoteWebElement(RemoteWebDriver parent, string id)
            : base(parent, id)
        {
        }

        #region IRenderedWebElement Members
        /// <summary>
        /// Gets the Location of an element and returns a Point object
        /// </summary>
        public Point Location
        {
            get
            { 
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Execute(DriverCommand.GetElementLocation, parameters);
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        /// <summary>
        /// Gets the <see cref="Size"/> of the element on the page
        /// </summary>
        public Size Size
        {
            get 
            { 
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Execute(DriverCommand.GetElementSize, parameters);
                Dictionary<string, object> rawSize = (Dictionary<string, object>)commandResponse.Value;
                int width = Convert.ToInt32(rawSize["width"], CultureInfo.InvariantCulture);
                int height = Convert.ToInt32(rawSize["height"], CultureInfo.InvariantCulture);
                return new Size(width, height);
            }
        }

        /// <summary>
        /// Gets a value indicating whether the element is currently being displayed
        /// </summary>
        public bool Displayed
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Execute(DriverCommand.IsElementDisplayed, parameters);
                return (bool)commandResponse.Value;
            }
        }

        /// <summary>
        /// Method to return the value of a CSS Property
        /// </summary>
        /// <param name="propertyName">CSS property key</param>
        /// <returns>string value of the CSS property</returns>
        public string GetValueOfCssProperty(string propertyName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            parameters.Add("propertyName", propertyName);
            Response commandResponse = Execute(DriverCommand.GetElementValueOfCssProperty, parameters);
            return commandResponse.Value.ToString();
        }

        /// <summary>
        /// Moves the mouse over the element to do a hover
        /// </summary>
        public void Hover()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            Execute(DriverCommand.HoverOverElement, parameters);
        }

        /// <summary>
        /// Move to an element, MouseDown on the element and move it by passing in the how many pixels horizontally and vertically you wish to move it
        /// </summary>
        /// <param name="moveRightBy">Integer to move it left or right</param>
        /// <param name="moveDownBy">Integer to move it up or down</param>
        public virtual void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            parameters.Add("x", moveRightBy);
            parameters.Add("y", moveDownBy);
            Execute(DriverCommand.DragElement, parameters);
        }

        /// <summary>
        /// Drag and Drop an element to another element
        /// </summary>
        /// <param name="element">Element you wish to drop on</param>
        public virtual void DragAndDropOn(IRenderedWebElement element)
        {
            Point currentLocation = Location;
            Point destination = element.Location;
            DragAndDropBy(destination.X - currentLocation.X, destination.Y - currentLocation.Y);
        }

        #endregion
    }
}
