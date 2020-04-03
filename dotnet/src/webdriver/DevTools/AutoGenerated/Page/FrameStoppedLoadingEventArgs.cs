namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame has stopped loading.
    /// </summary>
    public sealed class FrameStoppedLoadingEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has stopped loading.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
    }
}