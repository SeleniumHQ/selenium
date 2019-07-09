namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Clears the log.
    /// </summary>
    public sealed class ClearCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Log.clear";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearCommandResponse : ICommandResponse<ClearCommandSettings>
    {
    }
}