namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the Frame on the page.
    /// </summary>
    public sealed class Frame
    {
        /// <summary>
        /// Frame unique identifier.
        ///</summary>
        [JsonProperty("id")]
        public string Id
        {
            get;
            set;
        }
        /// <summary>
        /// Parent frame identifier.
        ///</summary>
        [JsonProperty("parentId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ParentId
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the loader associated with this frame.
        ///</summary>
        [JsonProperty("loaderId")]
        public string LoaderId
        {
            get;
            set;
        }
        /// <summary>
        /// Frame's name as specified in the tag.
        ///</summary>
        [JsonProperty("name", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Frame document's URL.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Frame document's security origin.
        ///</summary>
        [JsonProperty("securityOrigin")]
        public string SecurityOrigin
        {
            get;
            set;
        }
        /// <summary>
        /// Frame document's mimeType as determined by the browser.
        ///</summary>
        [JsonProperty("mimeType")]
        public string MimeType
        {
            get;
            set;
        }
        /// <summary>
        /// If the frame failed to load, this contains the URL that could not be loaded.
        ///</summary>
        [JsonProperty("unreachableUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UnreachableUrl
        {
            get;
            set;
        }
    }
}