using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class NotFoundException : WebDriverException
    {
        public NotFoundException()
            : base()
        {
        }

        public NotFoundException(string message)
            : base(message)
        {
        }
    }
}
