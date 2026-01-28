// <copyright file="Credential.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.VirtualAuth;

/// <summary>
/// A credential stored in a virtual authenticator.
/// Refer <see href="https://w3c.github.io/webauthn/#credential-parameters"/>
/// </summary>
public sealed class Credential
{
    private readonly byte[] id;
    private readonly byte[]? userHandle;

    private Credential(byte[] id, bool isResidentCredential, string? rpId, string privateKey, byte[]? userHandle, int signCount)
    {
        this.id = id ?? throw new ArgumentNullException(nameof(id));
        this.IsResidentCredential = isResidentCredential;
        this.RpId = rpId;
        this.PrivateKey = privateKey ?? throw new ArgumentNullException(nameof(privateKey));
        this.userHandle = userHandle;
        this.SignCount = signCount;
    }

    /// <summary>
    /// Creates a credential for use with a virtual authenticator.
    /// </summary>
    /// <param name="id">A byte array representing the ID of the credentials.</param>
    /// <param name="rpId">The ID of the relying party to which the credential is scoped.</param>
    /// <param name="privateKey">The private Key for the credentials.</param>
    /// <param name="signCount">The signature counter for the credentials.</param>
    /// <returns>The created instance of the Credential class.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="id"/> or <paramref name="privateKey"/> are <see langword="null"/>.</exception>
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
    /// <exception cref="ArgumentNullException">If <paramref name="id"/> or <paramref name="privateKey"/> are <see langword="null"/>.</exception>
    public static Credential CreateResidentCredential(byte[] id, string rpId, string privateKey, byte[] userHandle, int signCount)
    {
        return new Credential(id, true, rpId, privateKey, userHandle, signCount);
    }

    /// <summary>
    /// Gets the byte array of the ID of the credential.
    /// </summary>
    public byte[] Id => (byte[])id.Clone();

    /// <summary>
    /// Gets a value indicating whether this Credential is a resident credential.
    /// </summary>
    public bool IsResidentCredential { get; }

    /// <summary>
    /// Gets the ID of the relying party of this credential.
    /// </summary>
    public string? RpId { get; }

    /// <summary>
    /// Gets the private key of the credential.
    /// </summary>
    public string PrivateKey { get; }

    /// <summary>
    /// Gets the user handle of the credential.
    /// </summary>
    public byte[]? UserHandle => (byte[]?)userHandle?.Clone();

    /// <summary>
    /// Gets the signature counter associated to the public key credential source.
    /// </summary>
    public int SignCount { get; }

    /// <summary>
    /// Creates a Credential instance from a dictionary of values.
    /// </summary>
    /// <param name="dictionary">The dictionary of values to use to create the Credential instance.</param>
    /// <returns>The created instance of the Credential.</returns>
    public static Credential FromDictionary(Dictionary<string, object> dictionary)
    {
        byte[] id = Base64UrlEncoder.DecodeBytes((string)dictionary["credentialId"]);
        bool isResidentCredential = (bool)dictionary["isResidentCredential"];
        string? rpId = dictionary.TryGetValue("rpId", out object? r) ? (string)r : null;
        string privateKey = (string)dictionary["privateKey"];
        byte[]? userHandle = dictionary.TryGetValue("userHandle", out object? u) ? Base64UrlEncoder.DecodeBytes((string)u) : null;
        int signCount = (int)(long)dictionary["signCount"];

        return new Credential(id, isResidentCredential, rpId, privateKey, userHandle, signCount);
    }

    /// <summary>
    /// Serializes this Credential instance to a dictionary.
    /// </summary>
    /// <returns>The dictionary containing the values for this Credential.</returns>
    public Dictionary<string, object> ToDictionary()
    {
        Dictionary<string, object> toReturn = new Dictionary<string, object>();

        toReturn["credentialId"] = Base64UrlEncoder.Encode(this.id);
        toReturn["isResidentCredential"] = this.IsResidentCredential;
        if (this.RpId is not null)
        {
            toReturn["rpId"] = this.RpId;
        }
        toReturn["privateKey"] = this.PrivateKey;
        toReturn["signCount"] = this.SignCount;
        if (this.userHandle is not null)
        {
            toReturn["userHandle"] = Base64UrlEncoder.Encode(this.userHandle);
        }

        return toReturn;
    }
}
