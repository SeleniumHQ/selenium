using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Reflection;
using System.Runtime.Remoting.Messaging;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Intercepts the request to a collection of <see cref="IWebElement"/>'s
    /// </summary>
    sealed class ElementListProxy: Proxy
    {
        public ElementListProxy(Type typeToBeProxied, IElementLocator elementLocator)
            :base(typeToBeProxied, elementLocator)
        {}

        public override IMessage Invoke(IMessage msg)
        {
            var elements = ElementLocator.Elements;
            return base.Execute(msg as IMethodCallMessage, elements);
        }
    }
}
