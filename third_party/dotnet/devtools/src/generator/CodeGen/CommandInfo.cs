namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol command.
    /// </summary>
    public sealed class CommandInfo
    {
        public string CommandName
        {
            get;
            set;
        }

        public string FullTypeName
        {
            get;
            set;
        }
        public string FullResponseTypeName
        {
            get;
            set;
        }
    }
}
