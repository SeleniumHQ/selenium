namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Notification is issued every time when binding is called.
    /// </summary>
    public sealed class BindingCalledEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the payload
        /// </summary>
        [JsonProperty("payload")]
        public string Payload
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the context where the call was made.
        /// </summary>
        [JsonProperty("executionContextId")]
        public long ExecutionContextId
        {
            get;
            set;
        }
    }
}