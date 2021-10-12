// <copyright file="DomMutationData.cs" company="WebDriver Committers">
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

using Newtonsoft.Json;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides data about the changes in the value of an attribute on an element.
    /// </summary>
    public class DomMutationData
    {
        private string targetId;
        private string attributeName;
        private string attributeValue;
        private string attributeOriginalValue;

        /// <summary>
        /// Gets the ID of the element whose value is changing.
        /// </summary>
        [JsonProperty(PropertyName = "target")]
        public string TargetId
        {
            get { return this.targetId; }
            internal set { this.targetId = value; }
        }

        /// <summary>
        /// Gets the name of the attribute that is changing.
        /// </summary>
        [JsonProperty(PropertyName = "name")]
        public string AttributeName
        {
            get { return this.attributeName; }
            internal set { this.attributeName = value; }
        }

        /// <summary>
        /// Gets the value to which the attribute is being changed.
        /// </summary>
        [JsonProperty(PropertyName = "value")]
        public string AttributeValue
        {
            get { return this.attributeValue; }
            internal set { this.attributeValue = value; }
        }

        /// <summary>
        /// Gets the value from which the attribute has been changed.
        /// </summary>
        [JsonProperty(PropertyName = "oldValue")]
        public string AttributeOriginalValue
        {
            get { return this.attributeOriginalValue; }
            internal set { this.attributeOriginalValue = value; }
        }

        /// <summary>
        /// Returns a string that represents the current object.
        /// </summary>
        /// <returns>A string that represents the current object.</returns>
        public override string ToString()
        {
            return string.Format("target: {0}, name: {1}, value: {2}, originalValue: {3}", this.targetId, this.attributeName, this.attributeValue, this.attributeOriginalValue);
        }
    }
}
