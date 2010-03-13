using System.Collections.Generic;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to send commands to the remote server
    /// </summary>
    public class Command
    {
        private SessionId commandSessionId;
        private DriverCommand commandName;
        private Dictionary<string, object> commandParameters = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the Command class
        /// </summary>
        /// <param name="sessionId">Session ID the driver is using</param>
        /// <param name="name">Name of the command</param>
        /// <param name="parameters">Parameters for that command</param>
        public Command(SessionId sessionId, DriverCommand name, Dictionary<string, object> parameters)
        {
            commandSessionId = sessionId;
            if (parameters != null)
            {
                commandParameters = parameters;
            }

            commandName = name;
        }

        /// <summary>
        /// Gets the SessionID of the command
        /// </summary>
        public SessionId SessionId
        {
            get { return commandSessionId; }
        }

        /// <summary>
        /// Gets the command name
        /// </summary>
        public DriverCommand Name
        {
            get { return commandName; }
        }

        /// <summary>
        /// Gets the parameters of the command
        /// </summary>
        public Dictionary<string, object> Parameters
        {
            get { return commandParameters; }
        }

        /// <summary>
        /// Gets the parameters of the command as a JSON-encoded string.
        /// </summary>
        public string ParametersAsJsonString
        {
            get
            {
                string parametersString = string.Empty;
                if (commandParameters != null && commandParameters.Count > 0)
                {
                    parametersString = JsonConvert.SerializeObject(commandParameters, new JsonConverter[] { new PlatformJsonConverter(), new CookieJsonConverter(), new CharArrayJsonConverter() });
                }

                return parametersString;
            }
        }
        
        /// <summary>
        /// Returns a string of the Command object
        /// </summary>
        /// <returns>A string representation of the Command Object</returns>
        public override string ToString()
        {
            return string.Concat("[", SessionId, "]: ", Name, " ", Parameters.ToString());
        }
    }
}
