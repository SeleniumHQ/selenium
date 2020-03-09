namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame has been attached to its parent.
    /// </summary>
    public sealed class FrameAttachedEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has been attached.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// Parent frame identifier.
        /// </summary>
        [JsonProperty("parentFrameId")]
        public string ParentFrameId
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript stack trace of when frame was attached, only set if frame initiated from script.
        /// </summary>
        [JsonProperty("stack", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace Stack
        {
            get;
            set;
        }
    }
}