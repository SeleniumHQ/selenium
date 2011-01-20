using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides methods representing basic mouse actions.
    /// </summary>
    public interface IMouse
    {
        /// <summary>
        /// Clicks at a set of coordinates using the primary mouse button.
        /// </summary>
        /// <param name="where">An <see cref="ICoordinates"/> describing where to click.</param>
        void Click(ICoordinates where);

        /// <summary>
        /// Double-clicks at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to double-click.</param>
        void DoubleClick(ICoordinates where);

        /// <summary>
        /// Presses the primary mouse button at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to press the mouse button down.</param>
        void MouseDown(ICoordinates where);

        /// <summary>
        /// Releases the primary mouse button at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to release the mouse button.</param>
        void MouseUp(ICoordinates where);

        /// <summary>
        /// Moves the mouse to the specified set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to move the mouse to.</param>
        void MouseMove(ICoordinates where);

        /// <summary>
        /// Moves the mouse to the specified set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to click.</param>
        /// <param name="xOffset">A horizontal offset from the coordinates specified in <paramref name="where"/>.</param>
        /// <param name="yOffset">A vertical offset from the coordinates specified in <paramref name="where"/>.</param>
        void MouseMove(ICoordinates where, int xOffset, int yOffset);

        /// <summary>
        /// Clicks at a set of coordinates using the secondary mouse button.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to click.</param>
        void ContextClick(ICoordinates where);
        // TODO: Scroll wheel support
    }
}
