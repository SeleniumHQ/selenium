namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the Frame hierarchy.
    /// </summary>
    public sealed class FrameTree
    {
        /// <summary>
        /// Frame information for this tree item.
        ///</summary>
        [JsonProperty("frame")]
        public Frame Frame
        {
            get;
            set;
        }
        /// <summary>
        /// Child frames.
        ///</summary>
        [JsonProperty("childFrames", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public FrameTree[] ChildFrames
        {
            get;
            set;
        }
    }
}