// <copyright file="SessionId.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for maintaining a session for a test
    /// </summary>
    public class SessionId
    {
        private string sessionOpaqueKey;

        /// <summary>
        /// Initializes a new instance of the <see cref="SessionId"/> class
        /// </summary>
        /// <param name="opaqueKey">Key for the session in use</param>
        public SessionId(string opaqueKey)
        {
            this.sessionOpaqueKey = opaqueKey;
        }

        /// <summary>
        /// Get the value of the key
        /// </summary>
        /// <returns>The key in use</returns>
        public override string ToString()
        {
            return this.sessionOpaqueKey;
        }

        /// <summary>
        /// Get the hash code of the key
        /// </summary>
        /// <returns>The hash code of the key</returns>
        public override int GetHashCode()
        {
            return this.sessionOpaqueKey.GetHashCode();
        }

        /// <summary>
        /// Compares two Sessions
        /// </summary>
        /// <param name="obj">Session to compare</param>
        /// <returns>True if they are equal or False if they are not</returns>
        public override bool Equals(object obj)
        {
            bool objectsAreEqual = false;
            SessionId other = obj as SessionId;
            if (other != null)
            {
                objectsAreEqual = this.sessionOpaqueKey.Equals(other.sessionOpaqueKey);
            }

            return objectsAreEqual;
        }
    }
}
