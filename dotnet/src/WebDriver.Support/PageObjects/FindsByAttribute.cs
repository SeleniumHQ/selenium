using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks the program element with methods by which to find a corresponding element on the page. This 
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false)]
    public sealed class FindsByAttribute : Attribute
    {
        ///<summary>The method to look up the element</summary>
        [DefaultValue(How.Id)]
        public How How { get; set; }
        /// <summary>The value to lookup by (i.e. for How.Name, the actual name to look up)</summary>
        public String Using { get; set; }
        
        internal IEnumerable<By> Bys {
            get { return new[] {ByFactory.From(this)}; }
        }
    }
}