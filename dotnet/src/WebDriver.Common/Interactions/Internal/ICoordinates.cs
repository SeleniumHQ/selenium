using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    /// <summary>
    /// Provides location of the element using various frames of reference.
    /// </summary>
    public interface ICoordinates
    {
        /// <summary>
        /// Gets the location of an element in absolute screen coordinates.
        /// </summary>
        Point LocationOnScreen { get; }

        /// <summary>
        /// Gets the location of an element relative to the origin of the view port.
        /// </summary>
        Point LocationInViewPort { get; }

        /// <summary>
        /// Gets the location of an element's position within the HTML DOM.
        /// </summary>
        Point LocationInDOM { get; }

        /// <summary>
        /// Gets a locator providing a user-defined location for this element.
        /// </summary>
        object AuxilliaryLocator { get; }
    }
}
