using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects.Interfaces
{
    /// <summary>
    /// 
    /// </summary>
    public interface IElementLocator
    {
        /// <summary>
        /// This property should return a single IWebElement instance
        /// </summary>
        IWebElement Element { get; }
        /// <summary>
        /// This property should return a read-only collection of  IWebElement instances
        /// </summary>
        ReadOnlyCollection<IWebElement> Elements { get; }
    }
}
