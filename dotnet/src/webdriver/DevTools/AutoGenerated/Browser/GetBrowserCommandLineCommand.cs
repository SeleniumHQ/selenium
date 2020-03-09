namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the command line switches for the browser process if, and only if
    /// --enable-automation is on the commandline.
    /// </summary>
    public sealed class GetBrowserCommandLineCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.getBrowserCommandLine";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetBrowserCommandLineCommandResponse : ICommandResponse<GetBrowserCommandLineCommandSettings>
    {
        /// <summary>
        /// Commandline parameters
        ///</summary>
        [JsonProperty("arguments")]
        public string[] Arguments
        {
            get;
            set;
        }
    }
}