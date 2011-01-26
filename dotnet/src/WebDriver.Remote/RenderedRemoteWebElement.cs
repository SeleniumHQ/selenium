using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism to find Rendered Elements on the page
    /// </summary>
    public class RenderedRemoteWebElement : RemoteWebElement, IRenderedWebElement, ILocatable
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

        #region IRenderedWebElement Properties
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
        #endregion

        #region ILocatable Properties
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

        /// <summary>
        /// Gets the coordinates identifying the location of this element using
        /// various frames of reference.
        /// </summary>
        public ICoordinates Coordinates
        {
            get { return new RemoteCoordinates(this); }
        }
        #endregion

        #region IRenderedWebElement Methods
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
            Point currentLocation = this.Location;
            Point destination = element.Location;
            this.DragAndDropBy(destination.X - currentLocation.X, destination.Y - currentLocation.Y);
        }

        #endregion

        /// <summary>
        /// Provides methods specifying the location of the element.
        /// </summary>
        private class RemoteCoordinates : ICoordinates
        {
            private RenderedRemoteWebElement element;

            /// <summary>
            /// Initializes a new instance of the <see cref="RemoteCoordinates"/> class.
            /// </summary>
            /// <param name="element">The <see cref="RenderedRemoteWebElement"/> used to show the coordinates.</param>
            public RemoteCoordinates(RenderedRemoteWebElement element)
            {
                this.element = element;
            }

            #region ICoordinates Members
            /// <summary>
            /// Gets the location of an element in absolute screen coordinates.
            /// </summary>
            public Point LocationOnScreen
            {
                get { return this.element.LocationOnScreenOnceScrolledIntoView; }
            }

            /// <summary>
            /// Gets the location of an element relative to the origin of the view port.
            /// </summary>
            public Point LocationInViewport
            {
                get { throw new NotImplementedException(); }
            }

            /// <summary>
            /// Gets the location of an element's position within the HTML DOM.
            /// </summary>
            public Point LocationInDom
            {
                get { throw new NotImplementedException(); }
            }

            /// <summary>
            /// Gets a locator providing a user-defined location for this element, in this case, the internal ID.
            /// </summary>
            public object AuxiliaryLocator
            {
                get { return this.element.Id; }
            }

            #endregion
        }
    }
}
