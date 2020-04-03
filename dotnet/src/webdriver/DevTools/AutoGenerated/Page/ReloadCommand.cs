namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Reloads given page optionally ignoring the cache.
    /// </summary>
    public sealed class ReloadCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.reload";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// If true, browser cache is ignored (as if the user pressed Shift+refresh).
        /// </summary>
        [JsonProperty("ignoreCache", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IgnoreCache
        {
            get;
            set;
        }
        /// <summary>
        /// If set, the script will be injected into all frames of the inspected page after reload.
        /// Argument will be ignored if reloading dataURL origin.
        /// </summary>
        [JsonProperty("scriptToEvaluateOnLoad", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ScriptToEvaluateOnLoad
        {
            get;
            set;
        }
    }

    public sealed class ReloadCommandResponse : ICommandResponse<ReloadCommandSettings>
    {
    }
}