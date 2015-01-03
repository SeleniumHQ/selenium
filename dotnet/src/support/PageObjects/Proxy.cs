using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Runtime.Remoting.Proxies;

namespace OpenQA.Selenium.Support.PageObjects
{
    abstract class Proxy: RealProxy
    {
        protected readonly IElementLocator ElementLocator;

        public Proxy(Type typeToBeProxied, IElementLocator elementLocator)
            :base(typeToBeProxied)
        {
            this.ElementLocator = elementLocator;
        }

        /// <summary>
        /// This is the common behavior of proxy.
        /// The method will be used or overridden by subclasses
        /// </summary>
        /// <param name="msg">This is container of method invocation parameters</param>
        /// <param name="proxied">This the real proxied object</param>
        /// <returns>The ReturnMessage instance as a result of proxied method invocation.</returns>
        protected ReturnMessage Execute(IMethodCallMessage msg, object proxied)
        {
            MethodInfo proxiedMethod = msg.MethodBase as MethodInfo;
            return new ReturnMessage(proxiedMethod.Invoke(proxied, msg.Args), null, 0,
                        msg.LogicalCallContext, msg);
        }
    }
}
