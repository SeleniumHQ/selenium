// <copyright file="RemoteTouchScreen.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can execute advanced touch screen interactions.
    /// </summary>
    public class RemoteTouchScreen : ITouchScreen
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteTouchScreen"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the touch screen will be managed.</param>
        public RemoteTouchScreen(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Allows the execution of single tap on the screen, analogous to click using a Mouse.
        /// </summary>
        /// <param name="where">The <see cref="ICoordinates"/> object representing the location on the screen,
        /// usually an <see cref="IWebElement"/>.</param>
        public void SingleTap(ICoordinates where)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            this.driver.InternalExecute(DriverCommand.TouchSingleTap, parameters);
        }

        /// <summary>
        /// Allows the execution of the gesture 'down' on the screen. It is typically the first of a
        /// sequence of touch gestures.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        public void Down(int locationX, int locationY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("x", locationX);
            parameters.Add("y", locationY);
            this.driver.InternalExecute(DriverCommand.TouchPress, parameters);
        }

        /// <summary>
        /// Allows the execution of the gesture 'up' on the screen. It is typically the last of a
        /// sequence of touch gestures.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        public void Up(int locationX, int locationY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("x", locationX);
            parameters.Add("y", locationY);
            this.driver.InternalExecute(DriverCommand.TouchRelease, parameters);
        }

        /// <summary>
        /// Allows the execution of the gesture 'move' on the screen.
        /// </summary>
        /// <param name="locationX">The x coordinate relative to the view port.</param>
        /// <param name="locationY">The y coordinate relative to the view port.</param>
        public void Move(int locationX, int locationY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("x", locationX);
            parameters.Add("y", locationY);
            this.driver.InternalExecute(DriverCommand.TouchMove, parameters);
        }

        /// <summary>
        /// Creates a scroll gesture that starts on a particular screen location.
        /// </summary>
        /// <param name="where">The <see cref="ICoordinates"/> object representing the location on the screen
        /// where the scroll starts, usually an <see cref="IWebElement"/>.</param>
        /// <param name="offsetX">The x coordinate relative to the view port.</param>
        /// <param name="offsetY">The y coordinate relative to the view port.</param>
        public void Scroll(ICoordinates where, int offsetX, int offsetY)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            parameters.Add("xoffset", offsetX);
            parameters.Add("yoffset", offsetY);
            this.driver.InternalExecute(DriverCommand.TouchScroll, parameters);
        }

        /// <summary>
        /// Creates a scroll gesture for a particular x and y offset.
        /// </summary>
        /// <param name="offsetX">The horizontal offset relative to the view port.</param>
        /// <param name="offsetY">The vertical offset relative to the view port.</param>
        public void Scroll(int offsetX, int offsetY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("xoffset", offsetX);
            parameters.Add("yoffset", offsetY);
            this.driver.InternalExecute(DriverCommand.TouchScroll, parameters);
        }

        /// <summary>
        /// Allows the execution of double tap on the screen, analogous to click using a Mouse.
        /// </summary>
        /// <param name="where">The <see cref="ICoordinates"/> object representing the location on the screen,
        /// usually an <see cref="IWebElement"/>.</param>
        public void DoubleTap(ICoordinates where)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            this.driver.InternalExecute(DriverCommand.TouchDoubleTap, parameters);
        }

        /// <summary>
        /// Allows the execution of a long press gesture on the screen.
        /// </summary>
        /// <param name="where">The <see cref="ICoordinates"/> object representing the location on the screen,
        /// usually an <see cref="IWebElement"/>.</param>
        public void LongPress(ICoordinates where)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            this.driver.InternalExecute(DriverCommand.TouchLongPress, parameters);
        }

        /// <summary>
        /// Creates a flick gesture for the current view.
        /// </summary>
        /// <param name="speedX">The horizontal speed in pixels per second.</param>
        /// <param name="speedY">The vertical speed in pixels per second.</param>
        public void Flick(int speedX, int speedY)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("xspeed", speedX);
            parameters.Add("yspeed", speedY);
            this.driver.InternalExecute(DriverCommand.TouchFlick, parameters);
        }

        /// <summary>
        /// Creates a flick gesture for the current view starting at a specific location.
        /// </summary>
        /// <param name="where">The <see cref="ICoordinates"/> object representing the location on the screen
        /// where the scroll starts, usually an <see cref="IWebElement"/>.</param>
        /// <param name="offsetX">The x offset relative to the viewport.</param>
        /// <param name="offsetY">The y offset relative to the viewport.</param>
        /// <param name="speed">The speed in pixels per second.</param>
        public void Flick(Interactions.Internal.ICoordinates where, int offsetX, int offsetY, int speed)
        {
            if (where == null)
            {
                throw new ArgumentNullException("where", "where coordinates cannot be null");
            }

            string elementId = where.AuxiliaryLocator.ToString();
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("element", elementId);
            parameters.Add("xoffset", offsetX);
            parameters.Add("yoffset", offsetY);
            parameters.Add("speed", speed);
            this.driver.InternalExecute(DriverCommand.TouchFlick, parameters);
        }
    }
}
