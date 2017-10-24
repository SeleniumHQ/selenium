// <copyright file="CommandInfo.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Net;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides the execution information for a <see cref="DriverCommand"/>.
    /// </summary>
    public class CommandInfo
    {
        /// <summary>
        /// POST verb for the command info
        /// </summary>
        public const string PostCommand = "POST";

        /// <summary>
        /// GET verb for the command info
        /// </summary>
        public const string GetCommand = "GET";

        /// <summary>
        /// DELETE verb for the command info
        /// </summary>
        public const string DeleteCommand = "DELETE";

        private const string SessionIdPropertyName = "sessionId";

        private string resourcePath;
        private string method;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommandInfo"/> class
        /// </summary>
        /// <param name="method">Method of the Command</param>
        /// <param name="resourcePath">Relative URL path to the resource used to execute the command</param>
        public CommandInfo(string method, string resourcePath)
        {
            this.resourcePath = resourcePath;
            this.method = method;
        }

        /// <summary>
        /// Gets the URL representing the path to the resource.
        /// </summary>
        public string ResourcePath
        {
            get { return this.resourcePath; }
        }

        /// <summary>
        /// Gets the HTTP method associated with the command.
        /// </summary>
        public string Method
        {
            get { return this.method; }
        }

        /// <summary>
        /// Creates the full URI associated with this command, substituting command
        /// parameters for tokens in the URI template.
        /// </summary>
        /// <param name="baseUri">The base URI associated with the command.</param>
        /// <param name="commandToExecute">The command containing the parameters with which
        /// to substitute the tokens in the template.</param>
        /// <returns>The full URI for the command, with the parameters of the command
        /// substituted for the tokens in the template.</returns>
        public Uri CreateCommandUri(Uri baseUri, Command commandToExecute)
        {
            string[] urlParts = this.resourcePath.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < urlParts.Length; i++)
            {
                string urlPart = urlParts[i];
                if (urlPart.StartsWith("{", StringComparison.OrdinalIgnoreCase) && urlPart.EndsWith("}", StringComparison.OrdinalIgnoreCase))
                {
                    urlParts[i] = GetCommandPropertyValue(urlPart, commandToExecute);
                }
            }

            Uri fullUri;
            string relativeUrlString = string.Join("/", urlParts);
            Uri relativeUri = new Uri(relativeUrlString, UriKind.Relative);
            bool uriCreateSucceeded = Uri.TryCreate(baseUri, relativeUri, out fullUri);
            if (!uriCreateSucceeded)
            {
                throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "Unable to create URI from base {0} and relative path {1}", baseUri == null ? string.Empty : baseUri.ToString(), relativeUrlString));
            }

            return fullUri;
        }

        private static string GetCommandPropertyValue(string propertyName, Command commandToExecute)
        {
            string propertyValue = string.Empty;

            // Strip the curly braces
            propertyName = propertyName.Substring(1, propertyName.Length - 2);

            if (propertyName == SessionIdPropertyName)
            {
                if (commandToExecute.SessionId != null)
                {
                    propertyValue = commandToExecute.SessionId.ToString();
                }
            }
            else if (commandToExecute.Parameters != null && commandToExecute.Parameters.Count > 0)
            {
                // Extract the URL parameter, and remove it from the parameters dictionary
                // so it doesn't get transmitted as a JSON parameter.
                if (commandToExecute.Parameters.ContainsKey(propertyName))
                {
                    if (commandToExecute.Parameters[propertyName] != null)
                    {
                        propertyValue = commandToExecute.Parameters[propertyName].ToString();
                        commandToExecute.Parameters.Remove(propertyName);
                    }
                }
            }

            return propertyValue;
        }
    }
}
