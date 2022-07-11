// <copyright file="DesiredCapabilities.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.VirtualAuth
{
    /// <summary>
    /// Options for the creation of virtual authenticators.
    /// Refer https://w3c.github.io/webauthn/#sctn-automation
    /// </summary>
    public class VirtualAuthenticatorOptions
    {
        public static class Protocol
        {
            public static readonly string CTAP2 = "ctap2";
            public static readonly string U2F = "ctap1/u2f";
        }

        public static class Transport
        {
            public static readonly string BLE = "ble";
            public static readonly string INTERNAL = "internal";
            public static readonly string NFC = "nfc";
            public static readonly string USB = "usb";
        }

        private string protocol = Protocol.CTAP2;
        private string transport = Transport.USB;
        private bool hasResidentKey = false;
        private bool hasUserVerification = false;
        private bool isUserConsenting = true;
        private bool isUserVerified = false;

        /// <summary>
        /// Sets the protocol the Virtual Authenticator speaks
        /// </summary>
        /// <param name="protocol">Valid protocol value</param>
        /// <returns>VirtualAuthenticatorOptions</returns>
        public VirtualAuthenticatorOptions SetProtocol(string protocol)
        {
            if (string.Equals(Protocol.CTAP2, protocol) || string.Equals(Protocol.U2F, protocol))
            {
                this.protocol = protocol;
                return this;
            }
            else
            {
                throw new ArgumentException("Enter a valid protocol value." +
                "Refer to https://www.w3.org/TR/webauthn-2/#sctn-automation-virtual-authenticators for supported protocols.");
            }
        }

        /// <summary>
        /// Sets the transport authenticator needs to implement to communicate with clients
        /// </summary>
        /// <param name="transport">Valid transport value</param>
        /// <returns>VirtualAuthenticatorOptions</returns>
        public VirtualAuthenticatorOptions SetTransport(string transport)
        {
            if (Transport.BLE.Equals(transport) ||
            Transport.INTERNAL.Equals(transport) ||
            Transport.NFC.Equals(transport) ||
            Transport.USB.Equals(transport))
            {
                this.transport = transport;
                return this;
            }
            else
            {
                throw new ArgumentException("Enter a valid transport value." +
                "Refer to https://www.w3.org/TR/webauthn-2/#enum-transport for supported transport values.");
            }
        }

        /// <summary>
        /// If set to true the authenticator will support client-side discoverable credentials. 
        /// Refer https://w3c.github.io/webauthn/#client-side-discoverable-credential
        /// </summary>
        /// <param name="hasResidentKey">boolean value to set</param>
        /// <returns>VirtualAuthenticatorOptions</returns>
        public VirtualAuthenticatorOptions SetHasResidentKey(bool hasResidentKey)
        {
            this.hasResidentKey = hasResidentKey;
            return this;
        }

        /// <summary>
        /// If set to true, the authenticator supports user verification.
        /// Refer https://w3c.github.io/webauthn/#user-verification.
        /// </summary>
        /// <param name="hasUserVerification">boolean value to set</param>
        /// <returns></returns>
        public VirtualAuthenticatorOptions SetHasUserVerification(bool hasUserVerification)
        {
            this.hasUserVerification = hasUserVerification;
            return this;
        }

        /// <summary>
        /// If set to true, a user consent will always be granted. 
        /// Refer https://w3c.github.io/webauthn/#user-consent
        /// </summary>
        /// <param name="isUserConsenting">boolean value to set</param>
        /// <returns>VirtualAuthenticatorOptions</returns>
        public VirtualAuthenticatorOptions SetIsUserConsenting(bool isUserConsenting)
        {
            this.isUserConsenting = isUserConsenting;
            return this;
        }

        /// <summary>
        /// If set to true, User Verification will always succeed.
        /// Refer https://w3c.github.io/webauthn/#user-verification
        /// </summary>
        /// <param name="isUserVerified">boolean value to set</param>
        /// <returns>VirtualAuthenticatorOptions</returns>
        public VirtualAuthenticatorOptions SetIsUserVerified(bool isUserVerified)
        {
            this.isUserVerified = isUserVerified;
            return this;
        }

        public Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            toReturn["protocol"] = this.protocol;
            toReturn["transport"] = this.transport;
            toReturn["hasResidentKey"] = this.hasResidentKey;
            toReturn["hasUserVerification"] = this.hasUserVerification;
            toReturn["isUserConsenting"] = this.isUserConsenting;
            toReturn["isUserVerified"] = this.isUserVerified;

            return toReturn;
        }
    }
}