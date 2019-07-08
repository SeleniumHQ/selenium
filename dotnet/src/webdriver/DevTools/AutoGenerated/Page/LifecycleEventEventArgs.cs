namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired for top level page lifecycle events such as navigation, load, paint, etc.
    /// </summary>
    public sealed class LifecycleEventEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// Loader identifier. Empty string if the request is fetched from worker.
        /// </summary>
        [JsonProperty("loaderId")]
        public string LoaderId
        {
            get;
            set;
        }
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
        /// Gets or sets the timestamp
        /// </summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
    }
}