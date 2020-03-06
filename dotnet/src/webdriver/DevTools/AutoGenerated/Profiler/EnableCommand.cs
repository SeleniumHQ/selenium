namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.enable";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class EnableCommandResponse : ICommandResponse<EnableCommandSettings>
    {
    }
}