namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// CustomPreview
    /// </summary>
    public sealed class CustomPreview
    {
        /// <summary>
        /// The JSON-stringified result of formatter.header(object, config) call.
        /// It contains json ML array that represents RemoteObject.
        ///</summary>
        [JsonProperty("header")]
        public string Header
        {
            get;
            set;
        }
        /// <summary>
        /// If formatter returns true as a result of formatter.hasBody call then bodyGetterId will
        /// contain RemoteObjectId for the function that returns result of formatter.body(object, config) call.
        /// The result value is json ML array.
        ///</summary>
        [JsonProperty("bodyGetterId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BodyGetterId
        {
            get;
            set;
        }
    }
}