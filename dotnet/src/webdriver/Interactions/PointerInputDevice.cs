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
        Right = 2,

        /// <summary>
        /// The X1 button used for navigating back.
        /// </summary>
        Back = 3,

        /// <summary>
        /// The X2 button used for navigating forward.
        /// </summary>
        Forward = 4,
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
            return CreatePointerDown(button, new PointerEventProperties());
        }

        /// <summary>
        /// Creates a pointer down action.
        /// </summary>
        /// <remarks>
        /// MouseButton value applies to Pen types for primary, secondary and erase functionality (0, 2, and 5 respectively)
        /// </remarks>
        /// <param name="button">The button of the pointer that should be pressed.</param>
        /// <param name="properties">The specifications for the pointer event interaction</param>
        /// <returns>The action representing the pointer down gesture.</returns>
        public Interaction CreatePointerDown(MouseButton button, PointerEventProperties properties)
        {
            return new PointerDownInteraction(this, button, properties);
        }

        /// <summary>
        /// Creates a pointer up action.
        /// </summary>
        /// <param name="button">The button of the pointer that should be released.</param>
        /// <returns>The action representing the pointer up gesture.</returns>
        public Interaction CreatePointerUp(MouseButton button)
        {
            return CreatePointerUp(button, new PointerEventProperties());
        }

        /// <summary>
        /// Creates a pointer down action.
        /// </summary>
        /// <remarks>
        /// MouseButton value applies to Pen types for primary, secondary and erase functionality (0, 2, and 5 respectively)
        /// </remarks>
        /// <param name="button">The button of the pointer that should be pressed.</param>
        /// <param name="properties">The specifications for the pointer event interaction</param>
        /// <returns>The action representing the pointer down gesture.</returns>
        public Interaction CreatePointerUp(MouseButton button, PointerEventProperties properties)
        {
            return new PointerUpInteraction(this, button, properties);
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
            return CreatePointerMove(target, xOffset, yOffset, duration, new PointerEventProperties());
        }

        /// <summary>
        /// Creates a pointer move action to a specific element.
        /// </summary>
        /// <param name="target">The <see cref="IWebElement"/> used as the target for the move.</param>
        /// <param name="xOffset">The horizontal offset from the origin of the move.</param>
        /// <param name="yOffset">The vertical offset from the origin of the move.</param>
        /// <param name="duration">The length of time the move gesture takes to complete.</param>
        /// <param name="properties">The specifications for the pointer event interaction</param>
        /// <returns>The action representing the pointer move gesture.</returns>
        public Interaction CreatePointerMove(IWebElement target, int xOffset, int yOffset, TimeSpan duration, PointerEventProperties properties)
        {
            return new PointerMoveInteraction(this, target, CoordinateOrigin.Element, xOffset, yOffset, duration, properties);
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
            return CreatePointerMove(origin, xOffset, yOffset, duration, new PointerEventProperties());
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
        public Interaction CreatePointerMove(CoordinateOrigin origin, int xOffset, int yOffset, TimeSpan duration, PointerEventProperties properties)
        {
            if (origin == CoordinateOrigin.Element)
            {
                throw new ArgumentException("Using a value of CoordinateOrigin.Element without an element is not supported.", nameof(origin));
            }

            return new PointerMoveInteraction(this, null, origin, xOffset, yOffset, duration, properties);
        }

        /// <summary>
        /// Creates a pointer cancel action.
        /// </summary>
        /// <returns>The action representing the pointer cancel gesture.</returns>
        public Interaction CreatePointerCancel()
        {
            return new PointerCancelInteraction(this);
        }

        public class PointerEventProperties
        {
            private double? width;
            private double? height;
            private double? pressure;
            private double? tangentialPressure;
            private int? tiltX;
            private int? tiltY;
            private int? twist;
            private double? altitudeAngle;
            private double? azimuthAngle;

            /// <summary>
            /// Gets or sets the width (magnitude on x-axis) in pixels of the contact geometry of the pointer.
            /// </summary>
            public double? Width
            {
                get { return this.width; }
                set { this.width = value; }
            }

            /// <summary>
            /// Gets or sets the height (magnitude on y-axis) in pixels of the contact geometry of the pointer.
            /// </summary>
            public double? Height
            {
                get { return this.height; }
                set { this.height = value; }
            }
            /// <summary>
            /// Gets or sets the normalized pressure of the pointer input.
            /// </summary>
            /// <remarks>
            /// 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively.
            /// </remarks>
            public double? Pressure
            {
                get { return this.pressure; }
                set { this.pressure = value; }
            }
            /// <summary>
            /// Gets or sets the normalized tangential pressure (also known as barrel pressure) of the pointer input.
            /// </summary>
            /// <remarks>
            /// Valid values are between -1 and 1 with 0 being the neutral position of the control.
            /// Some hardware may only support positive values between 0 and 1.
            /// </remarks>
            public double? TangentialPressure
            {
                get { return this.tangentialPressure; }
                set { this.tangentialPressure = value; }
            }
            /// <summary>
            /// Gets or sets the plane angle in degrees between the Y-Z plane and the plane containing
            /// both the transducer (e.g. pen stylus) axis and the Y axis..
            /// </summary>
            /// <remarks>
            /// Valid values are between -90 and 90. A positive value is to the right.
            /// </remarks>
            public int? TiltX
            {
                get { return this.tiltX; }
                set { this.tiltX = value; }
            }
            /// <summary>
            /// Gets or sets the plane angle in degrees between the X-Z plane and the plane containing
            /// both the transducer (e.g. pen stylus) axis and the X axis..
            /// </summary>
            /// <remarks>
            /// Valid values are between -90 and 90. A positive value is toward the user.
            /// </remarks>
            public int? TiltY
            {
                get { return this.tiltY; }
                set { this.tiltY = value; }
            }
            /// <summary>
            /// Gets or sets the clockwise rotation in degrees of a transducer (e.g. stylus) around its own major axis
            /// </summary>
            /// <remarks>
            /// Valid values are between 0 and 359.
            /// </remarks>
            public int? Twist
            {
                get { return this.twist; }
                set { this.twist = value; }
            }
            /// <summary>
            /// Gets or sets the altitude in radians of the transducer (e.g. pen/stylus)
            /// </summary>
            /// <remarks>
            /// Valid values are between 0 and π/2, where 0 is parallel to the surface (X-Y plane),
            /// and π/2 is perpendicular to the surface.
            /// </remarks>
            public double? AltitudeAngle
            {
                get { return this.altitudeAngle; }
                set { this.altitudeAngle = value; }
            }
            /// <summary>
            /// Gets or sets the azimuth angle (in radians) of the transducer (e.g. pen/stylus)
            /// </summary>
            /// <remarks>
            /// Valid values are between 0 and 2π,
            /// where 0 represents a transducer whose cap is pointing in the direction of increasing X values,
            /// and the values progressively increase when going clockwise.
            /// </remarks>
            public double? AzimuthAngle
            {
                get { return this.azimuthAngle; }
                set { this.azimuthAngle = value; }
            }

            public Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();

                if (this.Width.HasValue)
                {
                    toReturn["width"] = this.Width.Value;
                }

                if (this.height.HasValue)
                {
                    toReturn["height"] = this.height.Value;
                }

                if (this.pressure.HasValue)
                {
                    toReturn["pressure"] = this.pressure.Value;
                }

                if (this.tangentialPressure.HasValue)
                {
                    toReturn["tangentialPressure"] = this.tangentialPressure.Value;
                }

                if (this.tiltX.HasValue)
                {
                    toReturn["tiltX"] = this.tiltX.Value;
                }

                if (this.tiltY.HasValue)
                {
                    toReturn["tiltY"] = this.tiltY.Value;
                }

                if (this.twist.HasValue)
                {
                    toReturn["twist"] = this.twist.Value;
                }

                if (this.altitudeAngle.HasValue)
                {
                    toReturn["altitudeAngle"] = this.altitudeAngle.Value;
                }

                if (this.azimuthAngle.HasValue)
                {
                    toReturn["azimuthAngle"] = this.azimuthAngle.Value;
                }

                return toReturn;
            }
        }

        private class PointerDownInteraction : Interaction
        {
            private MouseButton button;
            private PointerEventProperties eventProperties;

            public PointerDownInteraction(InputDevice sourceDevice, MouseButton button, PointerEventProperties properties)
                : base(sourceDevice)
            {
                this.button = button;
                this.eventProperties = properties;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn;
                if (eventProperties == null)
                {
                    toReturn = new Dictionary<string, object>();
                }
                else
                {
                    toReturn = eventProperties.ToDictionary();
                }
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
            private PointerEventProperties eventProperties;

            public PointerUpInteraction(InputDevice sourceDevice, MouseButton button, PointerEventProperties properties)
                : base(sourceDevice)
            {
                this.button = button;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn;
                if (eventProperties == null)
                {
                    toReturn = new Dictionary<string, object>();
                }
                else
                {
                    toReturn = eventProperties.ToDictionary();
                }

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
            private PointerEventProperties eventProperties;

            public PointerMoveInteraction(InputDevice sourceDevice, IWebElement target, CoordinateOrigin origin, int x, int y, TimeSpan duration, PointerEventProperties properties)
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
                this.eventProperties = properties;
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn;
                if (eventProperties == null)
                {
                    toReturn = new Dictionary<string, object>();
                }
                else
                {
                    toReturn = eventProperties.ToDictionary();
                }

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
