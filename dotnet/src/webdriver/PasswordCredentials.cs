// <copyright file="PasswordCredentials.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium
{
    /// <summary>
    /// A credentials provider that uses a user name and password for authentication.
    /// </summary>
    public class PasswordCredentials : ICredentials
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PasswordCredentials"/> class.
        /// </summary>
        public PasswordCredentials()
            : this(null, null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PasswordCredentials"/> class with the specified user name and password.
        /// </summary>
        /// <param name="userName">The user name for the credentials.</param>
        /// <param name="password">The password for the credentials.</param>
        public PasswordCredentials(string userName, string password)
        {
            UserName = userName;
            Password = password;
        }

        /// <summary>
        /// Gets the user name.
        /// </summary>
        public string UserName { get; private set; }

        /// <summary>
        /// Gets the password.
        /// </summary>
        public string Password { get; private set; }
    }
}
