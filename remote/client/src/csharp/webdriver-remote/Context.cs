using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    public class Context
    {
        private object internalContext;

        public Context(object raw)
        {
            internalContext = raw;
        }

        public override string ToString()
        {
            return internalContext.ToString();
        }
    }
}
