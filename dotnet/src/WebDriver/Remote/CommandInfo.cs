// <copyright file="CommandInfo.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Net;
using System.Text;

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
        /// Initializes a new instance of the CommandInfo class
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
        /// Creates a web request for your command
        /// </summary>
        /// <param name="baseUri">Uri that will have the command run against</param>
        /// <param name="commandToExecute">Command to execute</param>
        /// <returns>A web request of what has been run</returns>
        public HttpWebRequest CreateWebRequest(Uri baseUri, Command commandToExecute)
        {
            HttpWebRequest request = null;
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
            string relativeUrl = string.Join("/", urlParts);
            bool uriCreateSucceeded = Uri.TryCreate(baseUri, relativeUrl, out fullUri);
            if (uriCreateSucceeded)
            {
                request = HttpWebRequest.Create(fullUri) as HttpWebRequest;
                request.Method = this.method;
            }
            else
            {
                throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "Unable to create URI from base {0} and relative path {1}", baseUri == null ? string.Empty : baseUri.ToString(), relativeUrl));
            }

            return request;
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
