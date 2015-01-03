using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Reflection;
using Castle.DynamicProxy;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Intercepts the request to a single <see cref="IWebElement"/> 
    /// </summary>
    sealed class ElementInterceptor : Interceptor, IInterceptor
    {
        public ElementInterceptor(IElementLocator elementLocator)
            :base(elementLocator)
        {}

        public void Intercept(IInvocation invocation)
        {
            var element = ElementLocator.Element;
            if (typeof(IWrapsElement).IsAssignableFrom(invocation.Method.DeclaringType))
            {
                invocation.ReturnValue = element;
                return;
            }
            invocation.ReturnValue = base.Execute(invocation, element);
        }
    }
}
