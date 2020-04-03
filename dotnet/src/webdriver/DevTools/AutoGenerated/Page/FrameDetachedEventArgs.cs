namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame has been detached from its parent.
    /// </summary>
    public sealed class FrameDetachedEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has been detached.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
    }
}