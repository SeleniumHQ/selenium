namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Compressed image data requested by the `startScreencast`.
    /// </summary>
    public sealed class ScreencastFrameEventArgs : EventArgs
    {
        /// <summary>
        /// Base64-encoded compressed image.
        /// </summary>
        [JsonProperty("data")]
        public byte[] Data
        {
            get;
            set;
        }
        /// <summary>
        /// Screencast frame metadata.
        /// </summary>
        [JsonProperty("metadata")]
        public ScreencastFrameMetadata Metadata
        {
            get;
            set;
        }
        /// <summary>
        /// Frame number.
        /// </summary>
        [JsonProperty("sessionId")]
        public long SessionId
        {
            get;
            set;
        }
    }
}