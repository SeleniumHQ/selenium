using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to send commands to the remote server
    /// </summary>
    public class Command
    {
        private SessionId commandSessionId;
        private Context commandContext;
        private DriverCommand commandName;
        private object[] commandParameters;

        /// <summary>
        /// Initializes a new instance of the Command class
        /// </summary>
        /// <param name="sessionId">Session ID the driver is using</param>
        /// <param name="context">Context the driver is running</param>
        /// <param name="name">Name of the command</param>
        /// <param name="parameters">Parameters for that command</param>
        public Command(SessionId sessionId, Context context, DriverCommand name, object[] parameters)
        {
            commandSessionId = sessionId;
            commandContext = context;
            if (parameters == null)
            {
                commandParameters = new object[0];
            }
            else
            {
                commandParameters = parameters;
            }

            commandName = name;
        }

        /// <summary>
        /// Gets the SessionID of the command
        /// </summary>
        [JsonProperty("sessionId")]
        public SessionId SessionId
        {
            get { return commandSessionId; }
        }

        /// <summary>
        /// Gets the current context
        /// </summary>
        [JsonProperty("context")]
        public Context Context
        {
            get { return commandContext; }
        }

        /// <summary>
        /// Gets the command name
        /// </summary>
        [JsonProperty("commandName")]
        public DriverCommand Name
        {
            get { return commandName; }
        }

        /// <summary>
        /// Gets the parameters of the command
        /// </summary>
        [JsonProperty("parameters")]
        public object[] Parameters
        {
            get { return commandParameters; }
        }
        
        /// <summary>
        /// Returns a string of the Command object
        /// </summary>
        /// <returns>A string representation of the Command Object</returns>
        public override string ToString()
        {
            return string.Concat("[", SessionId, ", ", Context, "]: ", Name, " ", Parameters.ToString());
        }
    }
}
