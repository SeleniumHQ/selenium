// <copyright file="RequestParser.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
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

using System.Text;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Parses a request.
    /// </summary>
    internal class RequestParser : IRequestParser
    {
        private const string Pattern = @"^(?<method>[^\s]+)\s(?<path>[^\s]+)\sHTTP\/1\.1\r\n" + // request line
                                       @"((?<field_name>[^:\r\n]+):\s(?<field_value>[^\r\n]+)\r\n)+" + // headers
                                       @"\r\n" + // newline
                                       @"(?<body>.+)?";

        private static readonly Regex ParserRegex = new Regex(Pattern, RegexOptions.IgnoreCase | RegexOptions.Compiled);

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestParser"/> class.
        /// </summary>
        public RequestParser()
        {
        }

        /// <summary>
        /// Parses the specified data into a <see cref="WebSocketHttpRequest"/>.
        /// </summary>
        /// <param name="requestData">The data to be parsed.</param>
        /// <returns>The parsed <see cref="WebSocketHttpRequest"/>.</returns>
        public WebSocketHttpRequest Parse(byte[] requestData)
        {
            return this.Parse(requestData, "ws");
        }

        /// <summary>
        /// Parses the specified data into a <see cref="WebSocketHttpRequest"/> for the given scheme.
        /// </summary>
        /// <param name="requestData">The data to be parsed.</param>
        /// <param name="scheme">The scheme to use in parsing the data.</param>
        /// <returns>The parsed <see cref="WebSocketHttpRequest"/>.</returns>
        public WebSocketHttpRequest Parse(byte[] requestData, string scheme)
        {
            var body = Encoding.UTF8.GetString(requestData);
            Match match = ParserRegex.Match(body);

            if (!match.Success)
            {
                return null;
            }

            var request = new WebSocketHttpRequest
            {
                Method = match.Groups["method"].Value,
                Path = match.Groups["path"].Value,
                Body = match.Groups["body"].Value,
                Payload = requestData,
                Scheme = scheme
            };

            var fields = match.Groups["field_name"].Captures;
            var values = match.Groups["field_value"].Captures;
            for (var i = 0; i < fields.Count; i++)
            {
                var name = fields[i].ToString();
                var value = values[i].ToString();
                request.Headers[name] = value;
            }

            return request;
        }
    }
}
