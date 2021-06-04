// <copyright file="ErrorResponse.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a way to store errors from a response
    /// </summary>
    public class ErrorResponse
    {
        private StackTraceElement[] stackTrace;
        private string message = string.Empty;
        private string className = string.Empty;
        private string screenshot = string.Empty;

        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorResponse"/> class.
        /// </summary>
        public ErrorResponse()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorResponse"/> class using the specified values.
        /// </summary>
        /// <param name="responseValue">A <see cref="Dictionary{K, V}"/> containing names and values of
        /// the properties of this <see cref="ErrorResponse"/>.</param>
        public ErrorResponse(Dictionary<string, object> responseValue)
        {
            if (responseValue != null)
            {
                if (responseValue.ContainsKey("message"))
                {
                    if (responseValue["message"] != null)
                    {
                        this.message = responseValue["message"].ToString();
                    }
                    else
                    {
                        this.message = "The error did not contain a message.";
                    }
                }

                if (responseValue.ContainsKey("screen") && responseValue["screen"] != null)
                {
                    this.screenshot = responseValue["screen"].ToString();
                }

                if (responseValue.ContainsKey("class") && responseValue["class"] != null)
                {
                    this.className = responseValue["class"].ToString();
                }

                if (responseValue.ContainsKey("stackTrace") || responseValue.ContainsKey("stacktrace"))
                {
                    object[] stackTraceArray = null;

                    if (responseValue.ContainsKey("stackTrace"))
                    {
                        stackTraceArray = responseValue["stackTrace"] as object[];
                    }
                    else if (responseValue.ContainsKey("stacktrace"))
                    {
                        stackTraceArray = responseValue["stacktrace"] as object[];
                    }

                    if (stackTraceArray != null)
                    {
                        List<StackTraceElement> stackTraceList = new List<StackTraceElement>();
                        foreach (object rawStackTraceElement in stackTraceArray)
                        {
                            Dictionary<string, object> elementAsDictionary = rawStackTraceElement as Dictionary<string, object>;
                            if (elementAsDictionary != null)
                            {
                                stackTraceList.Add(new StackTraceElement(elementAsDictionary));
                            }
                        }

                        this.stackTrace = stackTraceList.ToArray();
                    }
                }
            }
        }

        /// <summary>
        /// Gets or sets the message from the response
        /// </summary>
        public string Message
        {
            get { return this.message; }
            set { this.message = value; }
        }

        /// <summary>
        /// Gets or sets the class name that threw the error
        /// </summary>
        public string ClassName
        {
            get { return this.className; }
            set { this.className = value; }
        }

        /// <summary>
        /// Gets or sets the screenshot of the error
        /// </summary>
        public string Screenshot
        {
            // TODO: (JimEvans) Change this to return an Image.
            get { return this.screenshot; }
            set { this.screenshot = value; }
        }

        /// <summary>
        /// Gets or sets the stack trace of the error
        /// </summary>
        public StackTraceElement[] StackTrace
        {
            get { return this.stackTrace; }
            set { this.stackTrace = value; }
        }
    }
}
