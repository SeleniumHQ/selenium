// <copyright file="WebElementProxyComparer.cs" company="WebDriver Committers">
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
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides comparison of proxied web elements.
    /// </summary>
    public class WebElementProxyComparer
    {
        /// <summary>
        /// Gets a value indicating whether two elements are equal.
        /// </summary>
        /// <param name="obj">An object representing a second element.</param>
        /// <returns><see langword="true"/> if the objects are equal; otherwise, <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            var wrapper = this as IWrapsElement;
            if (wrapper == null)
            {
                return base.Equals(obj);
            }

            return wrapper.WrappedElement.Equals(obj);
        }

        /// <summary>
        /// Gets a unique hash code for this object.
        /// </summary>
        /// <returns>A unique hash code for this object.</returns>
        public override int GetHashCode()
        {
            var wrapper = this as IWrapsElement;
            if (wrapper == null)
            {
                return base.GetHashCode();
            }

            return wrapper.WrappedElement.GetHashCode();
        }
    }
}
