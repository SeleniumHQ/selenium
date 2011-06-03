using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can discover where an element is on the screen.
    /// </summary>
    internal class RemoteCoordinates : ICoordinates
    {
        private RemoteWebElement element;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteCoordinates"/> class.
        /// </summary>
        /// <param name="element">The <see cref="RemoteWebElement"/> to be located.</param>
        public RemoteCoordinates(RemoteWebElement element)
        {
            this.element = element;
        }

        #region ICoordinates Members
        /// <summary>
        /// Gets the location of an element in absolute screen coordinates.
        /// </summary>
        public System.Drawing.Point LocationOnScreen
        {
            get { return this.element.LocationOnScreenOnceScrolledIntoView; }
        }

        /// <summary>
        /// Gets the location of an element relative to the origin of the view port.
        /// </summary>
        public System.Drawing.Point LocationInViewport
        {
            get { throw new NotImplementedException(); }
        }

        /// <summary>
        /// Gets the location of an element's position within the HTML DOM.
        /// </summary>
        public System.Drawing.Point LocationInDom
        {
            get { throw new NotImplementedException(); }
        }

        /// <summary>
        /// Gets a locator providing a user-defined location for this element.
        /// </summary>
        public object AuxiliaryLocator
        {
            get { return this.element.InternalElementId; }
        }
        #endregion
    }
}
