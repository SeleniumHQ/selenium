namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Creates an interal context for the remote driver
    /// </summary>
    public class Context
    {
        private object internalContext;

        /// <summary>
        /// Initializes a new instance of the Context class
        /// </summary>
        /// <param name="raw">Raw Object currently in context</param>
        public Context(object raw)
        {
            internalContext = raw;
        }

        /// <summary>
        /// Converts the object to string
        /// </summary>
        /// <returns>returns the object as a string</returns>
        public override string ToString()
        {
            return internalContext.ToString();
        }
    }
}
