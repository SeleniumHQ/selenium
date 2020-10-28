namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Represents a command used by the DevTools Remote Interface
    ///</summary>
    public interface ICommand
    {
        /// <summary>
        /// Gets the name of the command.
        /// </summary>
        string CommandName
        {
            get;
        }
    }

    /// <summary>
    /// Represents a response to a command submitted by the DevTools Remote Interface
    ///</summary>
    public interface ICommandResponse
    {
    }

    /// <summary>
    /// Represents a response to a command submitted by the DevTools Remote Interface
    ///</summary>
    public interface ICommandResponse<T> : ICommandResponse
        where T : ICommand
    {
    }
}