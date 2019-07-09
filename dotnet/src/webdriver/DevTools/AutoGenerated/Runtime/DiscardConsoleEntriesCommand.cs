namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Discards collected exceptions and console API calls.
    /// </summary>
    public sealed class DiscardConsoleEntriesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.discardConsoleEntries";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class DiscardConsoleEntriesCommandResponse : ICommandResponse<DiscardConsoleEntriesCommandSettings>
    {
    }
}