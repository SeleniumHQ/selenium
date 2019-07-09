namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired once navigation of the frame has completed. Frame is now associated with the new loader.
    /// </summary>
    public sealed class FrameNavigatedEventArgs : EventArgs
    {
        /// <summary>
        /// Frame object.
        /// </summary>
        [JsonProperty("frame")]
        public Frame Frame
        {
            get;
            set;
        }
    }
}