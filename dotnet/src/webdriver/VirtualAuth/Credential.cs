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

using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;

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

        private Credential(
        byte[] id,
        bool isResidentCredential,
        string rpId,
        string privateKey,
        byte[] userHandle,
        int signCount)
        {
            this.id = id;
            this.isResidentCredential = isResidentCredential;
            this.rpId = rpId;
            this.privateKey = privateKey;
            this.userHandle = userHandle;
            this.signCount = signCount;
        }

        public static Credential CreateNonResidentCredential(
            byte[] id,
            string rpId,
            string privateKey,
            int signCount)
        {
            return new Credential(id, false, rpId, privateKey, null, signCount);
        }

        public static Credential CreateResidentCredential(
            byte[] id,
            string rpId,
            string privateKey,
            byte[] userHandle,
            int signCount)
        {
            return new Credential(
              id,
              true,
              rpId,
              privateKey,
              userHandle,
              signCount);
        }

        public byte[] Id
        {
            get { return (byte[])id.Clone(); }
        }

        public bool IsResidentCredential
        {
            get { return this.isResidentCredential; }
        }
        public string RpId
        {
            get { return this.rpId; }
        }

        public string PrivateKey
        {
            get { return this.privateKey; }
        }

        public byte[] UserHandle
        {
            get { return userHandle == null ? null : (byte[])userHandle.Clone(); }
        }

        public int SignCount
        {
            get { return this.signCount; }
        }

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