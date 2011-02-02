using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks the program element with methods by which to find a corresponding element on the page. This 
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false)]
    public sealed class FindsByAttribute : Attribute
    {
        // TODO(dawagner): This duplication is a bit ugly, maybe pass in Bys (or a list of Bys).  Would probably require By to be a struct
        private List<By> findMethods = new List<By>();
    
        /// <summary>
        /// Gets or sets the ID to find the element by.
        /// </summary>
        public string Id
        { 
            get { throw new NotSupportedException(); } 
            set { this.findMethods.Add(By.Id(value)); } 
        }

        /// <summary>
        /// Gets or sets the link text to find the element by.
        /// </summary>
        public string LinkText
        { 
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.LinkText(value)); } 
        }
    
        /// <summary>
        /// Gets or sets the name to find the element by.
        /// </summary>
        public string Name 
        { 
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.Name(value)); } 
        }

        /// <summary>
        /// Gets or sets the XPath expression to find the element by.
        /// </summary>
        public string XPath 
        {
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.XPath(value)); }
        }

        /// <summary>
        /// Gets or sets the class name to find the element by.
        /// </summary>
        public string ClassName
        {
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.ClassName(value)); }
        }

        /// <summary>
        /// Gets or sets the partial link text to find the element by.
        /// </summary>
        public string PartialLinkText 
        { 
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.PartialLinkText(value)); } 
        }

        /// <summary>
        /// Gets or sets the tag name to find the element by.
        /// </summary>
        public string TagName 
        { 
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.TagName(value)); } 
        }

        /// <summary>
        /// Gets or sets the CSS selector to find the element by.
        /// </summary>
        public string CssSelector
        { 
            get { throw new NotSupportedException(); }
            set { this.findMethods.Add(By.CssSelector(value)); } 
        }

        /// <summary>
        /// Gets the list of methods by which to find an element.
        /// </summary>
        internal List<By> FindMethods
        {
            get { return this.findMethods; }
        }
    }
}