// <copyright file="Credentials.cs" company="WebDriver Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium.VirtualAuth
{
    /// <summary>
    /// A credential stored in a virtual authenticator.
    /// Refer https://w3c.github.io/webauthn/#credential-parameters
    /// </summary>
    public class Credential
    {
        private readonly byte[] id;
        private readonly bool isResidentCredential;
        private readonly string rpId;
        private readonly string privateKey;
        private readonly byte[] userHandle;
        private readonly int signCount;

        private Credential(byte[] id, bool isResidentCredential, string rpId, string privateKey, byte[] userHandle, int signCount)
        {
            this.id = id;
            this.isResidentCredential = isResidentCredential;
            this.rpId = rpId;
            this.privateKey = privateKey;
            this.userHandle = userHandle;
            this.signCount = signCount;
        }

        /// <summary>
        /// Creates a credential for use with a virtual authenticator.
        /// </summary>
        /// <param name="id">A byte array representing the ID of the credentials.</param>
        /// <param name="rpId">The ID of the relying party to which the credential is scoped.</param>
        /// <param name="privateKey">The private Key for the credentials.</param>
        /// <param name="signCount">The signature counter for the credentials.</param>
        /// <returns>The created instance of the Credential class.</returns>
        public static Credential CreateNonResidentCredential(byte[] id, string rpId, string privateKey, int signCount)
        {
            return new Credential(id, false, rpId, privateKey, null, signCount);
        }

        /// <summary>
        /// Creates a credential for use with a virtual authenticator.
        /// </summary>
        /// <param name="id">A byte array representing the ID of the credentials.</param>
        /// <param name="rpId">The ID of the relying party to which the credential is scoped.</param>
        /// <param name="privateKey">The private Key for the credentials.</param>
        /// <param name="userHandle">The user handle associated to the credential.</param>
        /// <param name="signCount">The signature counter for the credentials.</param>
        /// <returns>The created instance of the Credential class.</returns>
        public static Credential CreateResidentCredential(byte[] id, string rpId, string privateKey, byte[] userHandle, int signCount)
        {
            return new Credential(id, true, rpId, privateKey, userHandle, signCount);
        }

        /// <summary>
        /// Gets the byte array of the ID of the credential.
        /// </summary>
        public byte[] Id
        {
            get { return (byte[])id.Clone(); }
        }

        /// <summary>
        /// Gets a value indicating whether this Credential is a resident credential.
        /// </summary>
        public bool IsResidentCredential
        {
            get { return this.isResidentCredential; }
        }

        /// <summary>
        /// Gets the ID of the relying party of this credential.
        /// </summary>
        public string RpId
        {
            get { return this.rpId; }
        }

        /// <summary>
        /// Gets the private key of the credential.
        /// </summary>
        public string PrivateKey
        {
            get { return this.privateKey; }
        }

        /// <summary>
        /// Gets the user handle of the credential.
        /// </summary>
        public byte[] UserHandle
        {
            get { return userHandle == null ? null : (byte[])userHandle.Clone(); }
        }

        /// <summary>
        /// Gets the signature counter associated to the public key credential source.
        /// </summary>
        public int SignCount
        {
            get { return this.signCount; }
        }

        /// <summary>
        /// Creates a Credential instance from a dictionary of values.
        /// </summary>
        /// <param name="dictionary">The dictionary of values to use to create the Credential instance.</param>
        /// <returns>The created instance of the Credential.</returns>
        public static Credential FromDictionary(Dictionary<string, object> dictionary)
        {
            return new Credential(
                Base64UrlEncoder.DecodeBytes((string)dictionary["credentialId"]),
                (bool)dictionary["isResidentCredential"],
                dictionary.ContainsKey("rpId") ? (string)dictionary["rpId"] : null,
                (string)dictionary["privateKey"],
                dictionary.ContainsKey("userHandle") ? Base64UrlEncoder.DecodeBytes((string)dictionary["userHandle"]) : null,
                (int)((long)dictionary["signCount"]));
        }

        /// <summary>
        /// Serializes this Credential instance to a dictionary.
        /// </summary>
        /// <returns>The dictionary containing the values for this Credential.</returns>
        public Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            toReturn["credentialId"] = Base64UrlEncoder.Encode(this.id);
            toReturn["isResidentCredential"] = this.isResidentCredential;
            toReturn["rpId"] = this.rpId;
            toReturn["privateKey"] = this.privateKey;
            toReturn["signCount"] = this.signCount;
            if (this.userHandle != null)
            {
                toReturn["userHandle"] = Base64UrlEncoder.Encode(this.userHandle);
            }

            return toReturn;
        }
    }
}
