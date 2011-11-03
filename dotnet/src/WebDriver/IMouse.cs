// <copyright file="IMouse.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

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
        /// <param name="offsetX">A horizontal offset from the coordinates specified in <paramref name="where"/>.</param>
        /// <param name="offsetY">A vertical offset from the coordinates specified in <paramref name="where"/>.</param>
        void MouseMove(ICoordinates where, int offsetX, int offsetY);

        /// <summary>
        /// Clicks at a set of coordinates using the secondary mouse button.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to click.</param>
        void ContextClick(ICoordinates where);

        // TODO: Scroll wheel support
    }
}
