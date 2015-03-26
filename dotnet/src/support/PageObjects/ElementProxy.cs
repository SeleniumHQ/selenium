using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Reflection;
using OpenQA.Selenium.Internal;
using System.Runtime.Remoting.Messaging;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Intercepts the request to a single <see cref="IWebElement"/> 
    /// </summary>
    sealed class ElementProxy : Proxy
    {
        public ElementProxy(Type typeToBeProxied, IElementLocator elementLocator)
            : base(typeToBeProxied, elementLocator)
        {}

        public override IMessage Invoke(IMessage msg)
        {
            var element = ElementLocator.Element;
            IMethodCallMessage call = msg as IMethodCallMessage;

            if (typeof(IWrapsElement).IsAssignableFrom((call.MethodBase as MethodInfo).DeclaringType))
            {
                return new ReturnMessage(element, null, 0,
                        call.LogicalCallContext, call);
            }
            return base.Execute(call, element);

        }
    }
}
