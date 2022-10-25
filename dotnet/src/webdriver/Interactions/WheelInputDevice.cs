// <copyright file="WheelInputDevice.cs" company="WebDriver Committers">
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

using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Represents a wheel input device, such as a mouse wheel.
    /// </summary>
    public class WheelInputDevice : InputDevice
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WheelInputDevice"/> class.
        /// </summary>
        public WheelInputDevice()
            : this(Guid.NewGuid().ToString())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WheelInputDevice"/> class, given the device's name.
        /// </summary>
        /// <param name="deviceName">The unique name of this input device.</param>
        public WheelInputDevice(string deviceName)
            : base(deviceName)
        {
        }

        /// <summary>
        /// Gets the type of device for this input device.
        /// </summary>
        public override InputDeviceKind DeviceKind
        {
            get { return InputDeviceKind.Wheel; }
        }

        /// <summary>
        /// Returns a value for this input device that can be transmitted across the wire to a remote end.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representing this action.</returns>
        public override Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            toReturn["type"] = "wheel";
            toReturn["id"] = this.DeviceName;

            return toReturn;
        }

        /// <summary>
        /// Creates a wheel scroll action.
        /// </summary>
        /// <param name="deltaX">The distance along the X axis to scroll using the wheel.</param>
        /// <param name="deltaY">The distance along the Y axis to scroll using the wheel.</param>
        /// <param name="duration">The duration of the scroll action.</param>
        /// <returns>The <see cref="Interaction"/> representing the wheel scroll.</returns>
        public Interaction CreateWheelScroll(int deltaX, int deltaY, TimeSpan duration)
        {
            return new WheelScrollInteraction(this, null, CoordinateOrigin.Viewport, 0, 0, deltaX, deltaY, duration);
        }

        /// <summary>
        /// Creates a wheel scroll action beginning with an element.
        /// </summary>
        /// <param name="target">The <see cref="IWebElement"/> in which to begin the scroll.</param>
        /// <param name="xOffset">The horizontal offset from the center of the target element from which to start the scroll.</param>
        /// <param name="yOffset">The vertical offset from the center of the target element from which to start the scroll.</param>
        /// <param name="deltaX">The distance along the X axis to scroll using the wheel.</param>
        /// <param name="deltaY">The distance along the Y axis to scroll using the wheel.</param>
        /// <param name="duration">The duration of the scroll action.</param>
        /// <returns>The <see cref="Interaction"/> representing the wheel scroll.</returns>
        public Interaction CreateWheelScroll(IWebElement target, int xOffset, int yOffset, int deltaX, int deltaY, TimeSpan duration)
        {
            return new WheelScrollInteraction(this, target, CoordinateOrigin.Element, xOffset, yOffset, deltaX, deltaY, duration);
        }

        /// <summary>
        /// Creates a wheel scroll action.
        /// </summary>
        /// <param name="origin">The coordinate origin, either the view port or the current pointer position, from which to begin the scroll.</param>
        /// <param name="xOffset">The horizontal offset from the center of the origin from which to start the scroll.</param>
        /// <param name="yOffset">The vertical offset from the center of the origin from which to start the scroll.</param>
        /// <param name="deltaX">The distance along the X axis to scroll using the wheel.</param>
        /// <param name="deltaY">The distance along the Y axis to scroll using the wheel.</param>
        /// <param name="duration">The duration of the scroll action.</param>
        /// <returns>The <see cref="Interaction"/> representing the wheel scroll.</returns>
        public Interaction CreateWheelScroll(CoordinateOrigin origin, int xOffset, int yOffset, int deltaX, int deltaY, TimeSpan duration)
        {
            return new WheelScrollInteraction(this, null, origin, xOffset, yOffset, deltaX, deltaY, duration);
        }

        public class ScrollOrigin
        {
            private IWebElement element;
            private bool viewport;
            private int xOffset = 0;
            private int yOffset = 0;

            public IWebElement Element
            {
                get { return this.element; }
                set { this.element = value; }
            }

            public bool Viewport
            {
                get { return this.viewport; }
                set { this.viewport = value; }
            }

            public int XOffset
            {
                get { return this.xOffset; }
                set { this.xOffset = value; }
            }

            public int YOffset
            {
                get { return this.yOffset; }
                set { this.yOffset = value; }
            }

        }

        private class WheelScrollInteraction : Interaction
        {
            private IWebElement target;
            private int x = 0;
            private int y = 0;
            private int deltaX = 0;
            private int deltaY = 0;
            private TimeSpan duration = TimeSpan.MinValue;
            private CoordinateOrigin origin = CoordinateOrigin.Viewport;

            public WheelScrollInteraction(InputDevice sourceDevice, IWebElement target, CoordinateOrigin origin, int x, int y, int deltaX, int deltaY, TimeSpan duration)
                :base(sourceDevice)
            {
                if (target != null)
                {
                    this.target = target;
                    this.origin = CoordinateOrigin.Element;
                }
                else
                {
                    if (this.origin != CoordinateOrigin.Element)
                    {
                        this.origin = origin;
                    }
                }

                if (duration != TimeSpan.MinValue)
                {
                    this.duration = duration;
                }

                this.x = x;
                this.y = y;
                this.deltaX = deltaX;
                this.deltaY = deltaY;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();

                toReturn["type"] = "scroll";
                if (this.duration != TimeSpan.MinValue)
                {
                    toReturn["duration"] = Convert.ToInt64(this.duration.TotalMilliseconds);
                }

                if (this.target != null)
                {
                    toReturn["origin"] = this.ConvertElement();
                }
                else
                {
                    toReturn["origin"] = this.origin.ToString().ToLowerInvariant();
                }

                toReturn["x"] = this.x;
                toReturn["y"] = this.y;

                toReturn["deltaX"] = this.deltaX;
                toReturn["deltaY"] = this.deltaY;

                return toReturn;
            }

            private Dictionary<string, object> ConvertElement()
            {
                IWebDriverObjectReference elementReference = this.target as IWebDriverObjectReference;
                if (elementReference == null)
                {
                    IWrapsElement elementWrapper = this.target as IWrapsElement;
                    if (elementWrapper != null)
                    {
                        elementReference = elementWrapper.WrappedElement as IWebDriverObjectReference;
                    }
                }

                if (elementReference == null)
                {
                    throw new ArgumentException("Target element cannot be converted to IWebElementReference");
                }

                Dictionary<string, object> elementDictionary = elementReference.ToDictionary();
                return elementDictionary;
            }
        }
    }
}
