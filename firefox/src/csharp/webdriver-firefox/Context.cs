using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    internal class Context
    {
        private string contextValue = string.Empty;

        public Context()
        {
        }

        public Context(string fromExtension)
        {
            if (fromExtension.Length > 0)
            {
                this.contextValue = fromExtension;
            }
            else
            {
                this.contextValue = "0 ?";
            }
        }

        public string DriverId
        {
            get
            {
                string contextDriverId = null;
                if (contextValue != null)
                {
                    contextDriverId = contextValue.Split(new string[] { " " }, StringSplitOptions.None)[0];
                }
                return contextDriverId;
            }
        }

        public override string ToString()
        {
            return contextValue;
        }
    }
}
