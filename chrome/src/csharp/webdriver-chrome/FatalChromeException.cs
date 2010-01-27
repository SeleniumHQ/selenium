using System;
using OpenQA.Selenium;

namespace OpenQA.Selenium.Chrome
{
    public class FatalChromeException : WebDriverException
    {
        public FatalChromeException(String message)
            : base(message)
        {
        }
    }
}
