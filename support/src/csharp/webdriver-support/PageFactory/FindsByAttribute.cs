using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Support.PageFactory
{
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
    public class FindsByAttribute : Attribute
    {
        //TODO(dawagner): This duplication is a bit ugly, maybe pass in Bys (or a list of Bys).  Would probably require By to be a struct
    
        public string Id { get { throw new NotSupportedException(); } set { Bys.Add(By.Id(value)); } }

        public string LinkText { get { throw new NotSupportedException(); } set { Bys.Add(By.LinkText(value)); } }
    
        public string Name { get { throw new NotSupportedException(); } set { Bys.Add(By.Name(value)); } }

        public string XPath { get { throw new NotSupportedException(); } set { Bys.Add(By.XPath(value)); } }

        public string ClassName { get { throw new NotSupportedException(); } set { Bys.Add(By.ClassName(value)); } }

        public string PartialLinkText { get { throw new NotSupportedException(); } set { Bys.Add(By.PartialLinkText(value)); } }

        public string TagName { get { throw new NotSupportedException(); } set { Bys.Add(By.TagName(value)); } }

        public string CssSelector { get { throw new NotSupportedException(); } set { Bys.Add(By.CssSelector(value)); } }

        internal readonly List<By> Bys = new List<By>();
    }
}