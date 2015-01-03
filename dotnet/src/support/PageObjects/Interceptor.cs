using Castle.DynamicProxy;
using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace OpenQA.Selenium.Support.PageObjects
{
    abstract class Interceptor
    {
        protected readonly IElementLocator ElementLocator;

        public Interceptor(IElementLocator elementLocator)
        {
            this.ElementLocator = elementLocator;
        }

        /// <summary>
        /// This is the common behavior of intercetor.
        /// The method will be used or overridden by subclasses
        /// </summary>
        /// <param name="invocation">This is container of method invocation parameters</param>
        /// <param name="proxied">This the real proxied object</param>
        /// <returns>The values which is returned as a result of proxied method.</returns>
        protected object Execute(IInvocation invocation, object proxied)
        {
            MethodInfo proxiedMethod = invocation.Method;
            return proxiedMethod.Invoke(proxied, invocation.Arguments);
        }
    }
}
