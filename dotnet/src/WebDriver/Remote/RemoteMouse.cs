// <copyright file="RemoteMouse.cs" company="WebDriver Committers">
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
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can execute advanced mouse interactions.
    /// </summary>
    internal class RemoteMouse : IMouse
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteMouse"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the mouse will be managed.</param>
        public RemoteMouse(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region IMouse Members
        /// <summary>
        /// Clicks at a set of coordinates using the primary mouse button.
        /// </summary>
        /// <param name="where">An <see cref="ICoordinates"/> describing where to click.</param>
        public void Click(ICoordinates where)
        {
            this.MoveIfNeeded(where);
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("button", 0);
            this.driver.InternalExecute(DriverCommand.MouseClick, parameters);
        }

        /// <summary>
        /// Double-clicks at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to double-click.</param>
        public void DoubleClick(ICoordinates where)
        {
            this.driver.InternalExecute(DriverCommand.MouseDoubleClick, null);
        }

        /// <summary>
        /// Presses the primary mouse button at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to press the mouse button down.</param>
        public void MouseDown(ICoordinates where)
        {
            this.driver.InternalExecute(DriverCommand.MouseDown, null);
        }

        /// <summary>
        /// Releases the primary mouse button at a set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to release the mouse button.</param>
        public void MouseUp(ICoordinates where)
        {
            this.driver.InternalExecute(DriverCommand.MouseUp, null);
        }

        /// <summary>
        /// Moves the mouse to the specified set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to move the mouse to.</param>
        public void MouseMove(ICoordinates where)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            this.driver.InternalExecute(DriverCommand.MouseMoveTo, parameters);
        }

        /// <summary>
        /// Moves the mouse to the specified set of coordinates.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to click.</param>
        /// <param name="offsetX">A horizontal offset from the coordinates specified in <paramref name="where"/>.</param>
        /// <param name="offsetY">A vertical offset from the coordinates specified in <paramref name="where"/>.</param>
        public void MouseMove(ICoordinates where, int offsetX, int offsetY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            if (where != null)
            {
                string elementId = where.AuxiliaryLocator.ToString();
                parameters.Add("element", elementId);
            }
            else
            {
                parameters.Add("element", null);
            }

            parameters.Add("xoffset", offsetX);
            parameters.Add("yoffset", offsetY);
            this.driver.InternalExecute(DriverCommand.MouseMoveTo, parameters);
        }

        /// <summary>
        /// Clicks at a set of coordinates using the secondary mouse button.
        /// </summary>
        /// <param name="where">A <see cref="ICoordinates"/> describing where to click.</param>
        public void ContextClick(ICoordinates where)
        {
            this.MoveIfNeeded(where);
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("button", 2);
            this.driver.InternalExecute(DriverCommand.MouseClick, parameters);
        }
        #endregion

        private void MoveIfNeeded(ICoordinates where)
        {
            if (where != null)
            {
                this.MouseMove(where);
            }
        }
    }
}
