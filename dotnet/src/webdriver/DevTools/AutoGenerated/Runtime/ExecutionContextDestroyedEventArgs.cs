namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when execution context is destroyed.
    /// </summary>
    public sealed class ExecutionContextDestroyedEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the destroyed context
        /// </summary>
        [JsonProperty("executionContextId")]
        public long ExecutionContextId
        {
            get;
            set;
        }
    }
}