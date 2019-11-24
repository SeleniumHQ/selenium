namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Collect type profile.
    /// </summary>
    public sealed class TakeTypeProfileCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.takeTypeProfile";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class TakeTypeProfileCommandResponse : ICommandResponse<TakeTypeProfileCommandSettings>
    {
        /// <summary>
        /// Type profile for all scripts since startTypeProfile() was turned on.
        ///</summary>
        [JsonProperty("result")]
        public ScriptTypeProfile[] Result
        {
            get;
            set;
        }
    }
}