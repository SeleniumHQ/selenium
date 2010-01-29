namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Creates a new Chrome Exception
    /// </summary>
    public class FatalChromeException : WebDriverException
    {
        /// <summary>
        /// Initializes a new instance of the FatalChromeException class
        /// </summary>
        /// <param name="message">Message of the error</param>
        public FatalChromeException(string message)
            : base(message)
        {
        }
    }
}
