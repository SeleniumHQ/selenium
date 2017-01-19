// <copyright file="KeyInputDevice.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Represents a key input device, such as a keyboard.
    /// </summary>
    internal class KeyInputDevice : InputDevice
    {
        public KeyInputDevice()
            : this(Guid.NewGuid().ToString())
        {
        }

        public KeyInputDevice(string deviceName)
            : base(deviceName)
        {
        }

        public override InputDeviceKind DeviceKind
        {
            get { return InputDeviceKind.Key; }
        }

        /// <summary>
        /// Converts this input device into an object suitable for serializing across the wire.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representing this input device.</returns>
        public override Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            toReturn["type"] = "key";
            toReturn["id"] = this.DeviceName;

            return toReturn;
        }

        public Interaction CreateKeyDown(char codePoint)
        {
            return new KeyDownInteraction(this, codePoint);
        }

        public Interaction CreateKeyUp(char codePoint)
        {
            return new KeyUpInteraction(this, codePoint);
        }

        private class KeyDownInteraction : TypingInteraction
        {
            public KeyDownInteraction(InputDevice sourceDevice, char codePoint)
                : base(sourceDevice, "keyDown", codePoint)
            {
            }

            public override string ToString()
            {
                return string.Format(CultureInfo.InvariantCulture, "Key down [key: {0}]", Keys.GetDescription(this.Value));
            }
        }

        private class KeyUpInteraction : TypingInteraction
        {
            public KeyUpInteraction(InputDevice sourceDevice, char codePoint)
                : base(sourceDevice, "keyUp", codePoint)
            {
            }

            public override string ToString()
            {
                return string.Format(CultureInfo.InvariantCulture, "Key up [key: {0}]", Keys.GetDescription(this.Value));
            }
        }

        private class TypingInteraction : Interaction
        {

            private string type;
            private string value;

            public TypingInteraction(InputDevice sourceDevice, string type, char codePoint)
                : base(sourceDevice)
            {
                this.type = type;
                this.value = codePoint.ToString();
            }

            protected string Value
            {
                get { return this.value; }
            }

            public override Dictionary<string, object> ToDictionary()
            {
                Dictionary<string, object> toReturn = new Dictionary<string, object>();

                toReturn["type"] = this.type;
                toReturn["value"] = this.value;

                return toReturn;
            }
        }
    }
}
