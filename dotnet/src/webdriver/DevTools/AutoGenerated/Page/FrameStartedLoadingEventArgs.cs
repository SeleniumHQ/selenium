namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame has started loading.
    /// </summary>
    public sealed class FrameStartedLoadingEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has started loading.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
    }
}