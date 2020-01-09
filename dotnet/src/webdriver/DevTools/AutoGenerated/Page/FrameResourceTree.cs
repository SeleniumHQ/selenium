namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the Frame hierarchy along with their cached resources.
    /// </summary>
    public sealed class FrameResourceTree
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
        public FrameResourceTree[] ChildFrames
        {
            get;
            set;
        }
        /// <summary>
        /// Information about frame resources.
        ///</summary>
        [JsonProperty("resources")]
        public FrameResource[] Resources
        {
            get;
            set;
        }
    }
}