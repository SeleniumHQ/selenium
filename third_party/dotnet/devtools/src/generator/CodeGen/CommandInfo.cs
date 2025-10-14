namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol command.
    /// </summary>
    public sealed class CommandInfo(string commandName, string fullTypeName, string fullResponseTypeName)
    {
        public string CommandName { get; } = commandName;

        public string FullTypeName { get; } = fullTypeName;

        public string FullResponseTypeName { get; } = fullResponseTypeName;
    }
}
