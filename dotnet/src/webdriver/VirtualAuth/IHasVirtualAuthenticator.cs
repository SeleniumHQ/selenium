// <copyright file="IHasVirtualAuthenticator.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.VirtualAuth
{
    /// <summary>
    /// Interface indicating that an object supports using a virtual authenticator.
    /// </summary>
    public interface IHasVirtualAuthenticator
    {
        /// <summary>
        /// Adds a virtual authenticator.
        /// </summary>
        /// <param name="options">The VirtualAuthenticatorOptions to use in creating the authenticator.</param>
        /// <returns>The ID of the added virtual authenticator.</returns>
        string AddVirtualAuthenticator(VirtualAuthenticatorOptions options);

        /// <summary>
        /// Removes a virtual authenticator.
        /// </summary>
        /// <param name="id">The ID of the virtual authenticator to remove.</param>
        void RemoveVirtualAuthenticator(string id);

        /// <summary>
        /// Adds a credential to the virtual authenticator.
        /// </summary>
        /// <param name="credential">The credential to add to the authenticator.</param>
        void AddCredential(Credential credential);

        /// <summary>
        /// Gets a list of the credentials registered to the virtual authenticator.
        /// </summary>
        /// <returns>The list of credentials registered to the virtual authenticator.</returns>
        List<Credential> GetCredentials();

        /// <summary>
        /// Removes a credential from the virtual authenticator.
        /// </summary>
        /// <param name="credentialId">A byte array representing the ID of the credential to remove.</param>
        void RemoveCredential(byte[] credentialId);

        /// <summary>
        /// Removes a credential from the virtual authenticator.
        /// </summary>
        /// <param name="credentialId">A string representing the ID of the credential to remove.</param>
        void RemoveCredential(string credentialId);

        /// <summary>
        /// Removes all credentials registered to this virtual authenticator.
        /// </summary>
        void RemoveAllCredentials();

        /// <summary>
        /// Sets whether or not a user is verified in this virtual authenticator.
        /// </summary>
        /// <param name="verified"><see langword="true"/> if the user is verified; otherwise <see langword="false"/>.</param>
        void SetUserVerified(bool verified);
    }
}
