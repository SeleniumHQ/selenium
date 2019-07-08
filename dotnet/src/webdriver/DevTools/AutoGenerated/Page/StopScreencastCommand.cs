namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Stops sending each frame in the `screencastFrame`.
    /// </summary>
    public sealed class StopScreencastCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.stopScreencast";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopScreencastCommandResponse : ICommandResponse<StopScreencastCommandSettings>
    {
    }
}