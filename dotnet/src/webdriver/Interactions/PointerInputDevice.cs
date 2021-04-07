// <copyright file="PointerInputDevice.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Represents the origin of the coordinates for mouse movement.
    /// </summary>
    public enum CoordinateOrigin
    {
        /// <summary>
        /// The coordinate origin is the origin of the view port of the browser.
        /// </summary>
        Viewport,

        /// <summary>
        /// The origin of the movement is the most recent pointer location.
        /// </summary>
        Pointer,

        /// <summary>
        /// The origin of the movement is the center of the element specified.
        /// </summary>
        Element
    }

    /// <summary>
    /// Specifies the type of pointer a pointer device represents.
    /// </summary>
    public enum PointerKind
    {
        /// <summary>
        /// The pointer device is a mouse.
        /// </summary>
        Mouse,

        /// <summary>
        /// The pointer device is a pen or stylus.
        /// </summary>
        Pen,

        /// <summary>
        /// The pointer device is a touch screen device.
        /// </summary>
        Touch
    }

    /// <summary>
    /// Specifies the button used during a pointer down or up action.
    /// </summary>
    public enum MouseButton
    {
        /// <summary>
        /// This button is used for signifying touch actions.
        /// </summary>
        Touch = 0,

        /// <summary>
        /// The button used is the primary button.
        /// </summary>
        Left = 0,

        /// <summary>
        /// The button used is the middle button or mouse wheel.
        /// </summary>
        Middle = 1,

        /// <summary>
        /// The button used is the secondary button.
        /// </summary>
        Right = 2
    }

    /// <summary>
    /// Represents a pointer input device, such as a stylus, mouse, or finger on a touch screen.
    /// </summary>
    public class PointerInputDevice : InputDevice
    {
        private PointerKind pointerKind;

        /// <summary>
        /// Initializes a new instance of the <see cref="PointerInputDevice"/> class.
        /// </summary>
        public PointerInputDevice()
            : this(PointerKind.Mouse)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PointerInputDevice"/> class.
        /// </summary>
        /// <param name="pointerKind">The kind of pointer represented by this input device.</param>
        public PointerInputDevice(PointerKind pointerKind)
            : this(pointerKind, Guid.NewGuid().ToString())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PointerInputDevice"/> class.
        /// </summary>
        /// <param name="pointerKind">The kind of pointer represented by this input device.</param>
        /// <param name="deviceName">The unique name for this input device.</param>
        public PointerInputDevice(PointerKind pointerKind, string deviceName)
            : base(deviceName)
        {
            this.pointerKind = pointerKind;
        }

        /// <summary>
        /// Gets the type of device for this input device.
        /// </summary>
        public override InputDeviceKind DeviceKind
        {
            get { return InputDeviceKind.Pointer; }
        }

        /// <summary>
        /// Returns a value for this input device that can be transmitted across the wire to a remote end.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representing this action.</returns>
        public override Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            toReturn["type"] = "pointer";
            toReturn["id"] = this.DeviceName;

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["pointerType"] = this.pointerKind.ToString().ToLowerInvariant();
            toReturn["parameters"] = parameters;

            return toReturn;
        }

        /// <summary>
        /// Creates a pointer down action.
        /// </summary>
        /// <param name="button">The button of the pointer that should be pressed.</param>
        /// <returns>The action representing the pointer down gesture.</returns>
        public Interaction CreatePointerDown(MouseButton button)
        {
            return new PointerDownInteraction(this, button);
        }

        /// <summary>
        /// Creates a pointer up action.
        /// </summary>
        /// <param name="button">The button of the pointer that should be released.</param>
        /// <returns>The action representing the pointer up gesture.</returns>
        public Interaction CreatePointerUp(MouseButton button)
        {
            return new PointerUpInteraction(this, button);
        }

        /// <summary>
        /// Creates a pointer move action to a specific element.
        /// </summary>
        /// <param name="target">The <see cref="IWebElement"/> used as the target for the move.</param>
        /// <param name="xOffset">The horizontal offset from the origin of the move.</param>
        /// <param name="yOffset">The vertical offset from the origin of the move.</param>
        /// <param name="duration">The length of time the move gesture takes to complete.</param>
        /// <returns>The action representing the pointer move gesture.</returns>
        public Interaction CreatePointerMove(IWebElement target, int xOffset, int yOffset, TimeSpan duration)
        {
            return new PointerMoveInteraction(this, target, CoordinateOrigin.Element, xOffset, yOffset, duration);
        }

        /// <summary>
        /// Creates a pointer move action to an absolute coordinate.
        /// </summary>
        /// <param name="origin">The origin of coordinates for the move. Values can be relative to
        /// the view port origin, or the most recent pointer position.</param>
        /// <param name="xOffset">The horizontal offset from the origin of the move.</param>
        /// <param name="yOffset">The vertical offset from the origin of the move.</param>
        /// <param name="duration">The length of time the move gesture takes to complete.</param>
        /// <returns>The action representing the pointer move gesture.</returns>
        /// <exception cref="ArgumentException">Thrown when passing CoordinateOrigin.Element into origin.
        /// Users should us the other CreatePointerMove overload to move to a specific element.</exception>
        public Interaction CreatePointerMove(CoordinateOrigin origin, int xOffset, int yOffset, TimeSpan duration)
        {
            if (origin == CoordinateOrigin.Element)
            {
                throw new ArgumentException("Using a value of CoordinateOrigin.Element without an element is not supported.", "origin");
            }

            return new PointerMoveInteraction(this, null, origin, xOffset, yOffset, duration);
        }

        /// <summary>
        /// Creates a pointer cancel action.
        /// </summary>
        /// <returns>The action representing the pointer cancel gesture.</returns>
        public Interaction CreatePointerCancel()
        {
            return new PointerCancelInteraction(this);
        }

        private class PointerDownInteraction : Interaction
        {
            private MouseButton button;

            public PointerDownInteraction(InputDevice sourceDevice, MouseButton button)
                : base(sourceDevice)
            {
                this.button = button;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();
                toReturn["type"] = "pointerDown";
                toReturn["button"] = Convert.ToInt32(this.button, CultureInfo.InvariantCulture);

                return toReturn;
            }

            public override string ToString()
            {
                return "Pointer down";
            }
        }

        private class PointerUpInteraction : Interaction
        {
            private MouseButton button;

            public PointerUpInteraction(InputDevice sourceDevice, MouseButton button)
                : base(sourceDevice)
            {
                this.button = button;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();
                toReturn["type"] = "pointerUp";
                toReturn["button"] = Convert.ToInt32(this.button, CultureInfo.InvariantCulture);

                return toReturn;
            }

            public override string ToString()
            {
                return "Pointer up";
            }
        }

        private class PointerCancelInteraction : Interaction
        {
            public PointerCancelInteraction(InputDevice sourceDevice)
                : base(sourceDevice)
            {
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();
                toReturn["type"] = "pointerCancel";
                return toReturn;
            }

            public override string ToString()
            {
                return "Pointer cancel";
            }
        }

        private class PointerMoveInteraction : Interaction
        {
            private IWebElement target;
            private int x = 0;
            private int y = 0;
            private TimeSpan duration = TimeSpan.MinValue;
            private CoordinateOrigin origin = CoordinateOrigin.Pointer;

            public PointerMoveInteraction(InputDevice sourceDevice, IWebElement target, CoordinateOrigin origin, int x, int y, TimeSpan duration)
                : base(sourceDevice)
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
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();

                toReturn["type"] = "pointerMove";
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

                return toReturn;
            }

            public override string ToString()
            {
                string originDescription = this.origin.ToString();
                if (this.origin == CoordinateOrigin.Element)
                {
                    originDescription = this.target.ToString();
                }

                return string.Format(CultureInfo.InvariantCulture, "Pointer move [origin: {0}, x offset: {1}, y offset: {2}, duration: {3}ms]", originDescription, this.x, this.y, this.duration.TotalMilliseconds);
            }

            private Dictionary<string, object> ConvertElement()
            {
                IWebElementReference elementReference = this.target as IWebElementReference;
                if (elementReference == null)
                {
                    IWrapsElement elementWrapper = this.target as IWrapsElement;
                    if (elementWrapper != null)
                    {
                        elementReference = elementWrapper.WrappedElement as IWebElementReference;
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
