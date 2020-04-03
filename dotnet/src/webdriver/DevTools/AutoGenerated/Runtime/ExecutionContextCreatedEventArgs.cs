namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when new execution context is created.
    /// </summary>
    public sealed class ExecutionContextCreatedEventArgs : EventArgs
    {
        /// <summary>
        /// A newly created execution context.
        /// </summary>
        [JsonProperty("context")]
        public ExecutionContextDescription Context
        {
            get;
            set;
        }
    }
}