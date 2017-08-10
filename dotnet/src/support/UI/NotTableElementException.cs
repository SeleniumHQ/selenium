using System;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// This exception is thrown if the root element is not a table tag.
    /// </summary>
    public class NotTableElementException : Exception
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="tagName"></param>
        public NotTableElementException(string tagName)
        {
            Message = tagName;
        }

        public override string Message { get; }
    }
}