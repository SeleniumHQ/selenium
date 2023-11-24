// <copyright file="StackTraceElement.cs" company="WebDriver Committers">
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
using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Gives properties to get a stack trace
    /// </summary>
    public class StackTraceElement
    {
        private string fileName = string.Empty;
        private string className = string.Empty;
        private int lineNumber;
        private string methodName = string.Empty;

        /// <summary>
        /// Initializes a new instance of the <see cref="StackTraceElement"/> class.
        /// </summary>
        public StackTraceElement()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="StackTraceElement"/> class using the given property values.
        /// </summary>
        /// <param name="elementAttributes">A <see cref="Dictionary{K, V}"/> containing the names and values for the properties of this <see cref="StackTraceElement"/>.</param>
        public StackTraceElement(Dictionary<string, object> elementAttributes)
        {
            if (elementAttributes != null)
            {
                if (elementAttributes.ContainsKey("className") && elementAttributes["className"] != null)
                {
                    this.className = elementAttributes["className"].ToString();
                }

                if (elementAttributes.ContainsKey("methodName") && elementAttributes["methodName"] != null)
                {
                    this.methodName = elementAttributes["methodName"].ToString();
                }

                if (elementAttributes.ContainsKey("lineNumber"))
                {
                    int line = 0;
                    if (int.TryParse(elementAttributes["lineNumber"].ToString(), out line))
                    {
                        this.lineNumber = line;
                    }
                }

                if (elementAttributes.ContainsKey("fileName") && elementAttributes["fileName"] != null)
                {
                    this.fileName = elementAttributes["fileName"].ToString();
                }
            }
        }

        /// <summary>
        /// Gets or sets the value of the filename in the stack
        /// </summary>
        [JsonProperty("fileName")]
        public string FileName
        {
            get { return this.fileName; }
            set { this.fileName = value; }
        }

        /// <summary>
        /// Gets or sets the value of the Class name in the stack trace
        /// </summary>
        [JsonProperty("className")]
        public string ClassName
        {
            get { return this.className; }
            set { this.className = value; }
        }

        /// <summary>
        /// Gets or sets the line number
        /// </summary>
        [JsonProperty("lineNumber")]
        public int LineNumber
        {
            get { return this.lineNumber; }
            set { this.lineNumber = value; }
        }

        /// <summary>
        /// Gets or sets the Method name in the stack trace
        /// </summary>
        [JsonProperty("methodName")]
        public string MethodName
        {
            get { return this.methodName; }
            set { this.methodName = value; }
        }

        /// <summary>
        /// Gets a string representation of the object.
        /// </summary>
        /// <returns>A string representation of the object.</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "at {0}.{1} ({2}, {3})", this.className, this.methodName, this.fileName, this.lineNumber);
        }
    }
}
