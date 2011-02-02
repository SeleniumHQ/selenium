using System;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks the element so that lookups to the browser page are cached. This class cannot be inherited.
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Class, AllowMultiple = false)]
    public sealed class CacheLookupAttribute : Attribute
    {
    }
}