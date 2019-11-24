namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when object should be inspected (for example, as a result of inspect() command line API
    /// call).
    /// </summary>
    public sealed class InspectRequestedEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the object
        /// </summary>
        [JsonProperty("object")]
        public RemoteObject Object
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the hints
        /// </summary>
        [JsonProperty("hints")]
        public object Hints
        {
            get;
            set;
        }
    }
}