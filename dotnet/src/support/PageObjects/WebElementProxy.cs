// <copyright file="WebElementProxy.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Intercepts the request to a single <see cref="IWebElement"/>
    /// </summary>
    internal sealed class WebElementProxy : WebDriverObjectProxy, IWrapsElement
    {
        private IWebElement cachedElement;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebElementProxy"/> class.
        /// </summary>
        /// <param name="classToProxy">The <see cref="Type"/> of object for which to create a proxy.</param>
        /// <param name="locator">The <see cref="IElementLocator"/> implementation that determines
        /// how elements are located.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
        private WebElementProxy(Type classToProxy, IElementLocator locator, IEnumerable<By> bys, bool cache)
            : base(classToProxy, locator, bys, cache)
        {
        }

        /// <summary>
        /// Gets the <see cref="IWebElement"/> wrapped by this object.
        /// </summary>
        public IWebElement WrappedElement
        {
            get { return this.Element; }
        }

        /// <summary>
        /// Gets the IWebElement object this proxy represents, returning a cached one if requested.
        /// </summary>
        private IWebElement Element
        {
            get
            {
                if (!this.Cache || this.cachedElement == null)
                {
                    this.cachedElement = this.Locator.LocateElement(this.Bys);
                }

                return this.cachedElement;
            }
        }

        /// <summary>
        /// Creates an object used to proxy calls to properties and methods of an <see cref="IWebElement"/> object.
        /// </summary>
        /// <param name="classToProxy">The <see cref="Type"/> of object for which to create a proxy.</param>
        /// <param name="locator">The <see cref="IElementLocator"/> implementation that
        /// determines how elements are located.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <param name="cacheLookups"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
        /// <returns>An object used to proxy calls to properties and methods of the list of <see cref="IWebElement"/> objects.</returns>
        public static object CreateProxy(Type classToProxy, IElementLocator locator, IEnumerable<By> bys, bool cacheLookups)
        {
            return new WebElementProxy(classToProxy, locator, bys, cacheLookups).GetTransparentProxy();
        }

        /// <summary>
        /// Invokes the method that is specified in the provided <see cref="IMessage"/> on the
        /// object that is represented by the current instance.
        /// </summary>
        /// <param name="msg">An <see cref="IMessage"/> that contains a dictionary of
        /// information about the method call. </param>
        /// <returns>The message returned by the invoked method, containing the return value and any
        /// out or ref parameters.</returns>
        public override IMessage Invoke(IMessage msg)
        {
            var element = this.Element;
            IMethodCallMessage methodCallMessage = msg as IMethodCallMessage;

            if (typeof(IWrapsElement).IsAssignableFrom((methodCallMessage.MethodBase as MethodInfo).DeclaringType))
            {
                return new ReturnMessage(element, null, 0, methodCallMessage.LogicalCallContext, methodCallMessage);
            }

            return WebDriverObjectProxy.InvokeMethod(methodCallMessage, element);
        }
    }
}
#endif
