using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public class NeedsFreshDriverAttribute : Attribute
    {
        private bool beforeTest = false;
        private bool afterTest = false;

        public bool BeforeTest
        {
            get { return beforeTest; }
            set { beforeTest = value; }
        }

        public bool AfterTest
        {
            get { return afterTest; }
            set { afterTest = value; }
        }
    }
}
