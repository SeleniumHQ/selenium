using System;

namespace OpenQA.Selenium.Support.PageFactory
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Class, AllowMultiple = false)]
    public class CacheLookupAttribute : Attribute
    {
    }
}