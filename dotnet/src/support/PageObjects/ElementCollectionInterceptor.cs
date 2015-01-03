using Castle.DynamicProxy;
using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Reflection;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Intercepts the request to a collection of <see cref="IWebElement"/>'s
    /// </summary>
    sealed class ElementCollectionInterceptor: Interceptor, IInterceptor
    {
        public ElementCollectionInterceptor(IElementLocator elementLocator)
            :base(elementLocator)
        {}

        public void Intercept(IInvocation invocation)
        {
            var elements = ElementLocator.Elements;
            invocation.ReturnValue = base.Execute(invocation, elements);
        }
    }
}
