using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects.Interfaces
{
    /// <summary>
    /// A factory for producing <see cref="IElementLocator"/> s. It is expected that a new IElementLocator instance will be
    /// returned per call.
    /// </summary>
    public interface ILocatorFactory
    {
        /// <summary>
        /// When a field on a class needs to be decorated with an {@link ElementLocator} this method will
        /// be called.
        /// </summary>
        /// <param name="member"> a field OR property that should be filled</param>
        /// <returns>An <see cref="IElementLocator"/> instance</returns>
       IElementLocator CreateElementLocator(MemberInfo member); 
    }
}
