// <copyright file="WebDriverObjectProxy.cs" company="WebDriver Committers">
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

#if !NETSTANDARD2_0
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Runtime.Remoting.Proxies;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Represents a base proxy class for objects used with the PageFactory.
    /// </summary>
    internal abstract class WebDriverObjectProxy : RealProxy
    {
        private readonly IElementLocator locator;
        private readonly IEnumerable<By> bys;
        private readonly bool cache;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverObjectProxy"/> class.
        /// </summary>
        /// <param name="classToProxy">The <see cref="Type"/> of object for which to create a proxy.</param>
        /// <param name="locator">The <see cref="IElementLocator"/> implementation that
        /// determines how elements are located.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
        protected WebDriverObjectProxy(Type classToProxy, IElementLocator locator, IEnumerable<By> bys, bool cache)
            : base(classToProxy)
        {
            this.locator = locator;
            this.bys = bys;
            this.cache = cache;
        }

        /// <summary>
        /// Gets the <see cref="IElementLocator"/> implementation that determines how elements are located.
        /// </summary>
        protected IElementLocator Locator
        {
            get { return this.locator; }
        }

        /// <summary>
        /// Gets the list of methods by which to search for the elements.
        /// </summary>
        protected IEnumerable<By> Bys
        {
            get { return this.bys; }
        }

        /// <summary>
        /// Gets a value indicating whether element search results should be cached.
        /// </summary>
        protected bool Cache
        {
            get { return this.cache; }
        }

        /// <summary>
        /// Invokes a method on the object this proxy represents.
        /// </summary>
        /// <param name="msg">Message containing the parameters of the method being invoked.</param>
        /// <param name="representedValue">The object this proxy represents.</param>
        /// <returns>The <see cref="ReturnMessage"/> instance as a result of method invocation on the
        /// object which this proxy represents.</returns>
        protected static ReturnMessage InvokeMethod(IMethodCallMessage msg, object representedValue)
        {
            if (msg == null)
            {
                throw new ArgumentNullException("msg", "The message containing invocation information cannot be null");
            }

            MethodInfo proxiedMethod = msg.MethodBase as MethodInfo;
            return new ReturnMessage(proxiedMethod.Invoke(representedValue, msg.Args), null, 0, msg.LogicalCallContext, msg);
        }
    }
}
#endif
