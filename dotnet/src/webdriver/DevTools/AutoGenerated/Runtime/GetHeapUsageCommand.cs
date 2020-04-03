namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the JavaScript heap usage.
    /// It is the total usage of the corresponding isolate not scoped to a particular Runtime.
    /// </summary>
    public sealed class GetHeapUsageCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.getHeapUsage";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetHeapUsageCommandResponse : ICommandResponse<GetHeapUsageCommandSettings>
    {
        /// <summary>
        /// Used heap size in bytes.
        ///</summary>
        [JsonProperty("usedSize")]
        public double UsedSize
        {
            get;
            set;
        }
        /// <summary>
        /// Allocated heap size in bytes.
        ///</summary>
        [JsonProperty("totalSize")]
        public double TotalSize
        {
            get;
            set;
        }
    }
}