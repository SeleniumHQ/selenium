using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public class ErrorResponse
    {
        StackTraceElement[] _stackTrace;
        string _localizedMessage;
        string _message;
        string _className;
        string _screenshot;

        [JsonProperty("localizedMessage")]
        public string LocalizedMessage
        {
            get { return _localizedMessage; }
            set { _localizedMessage = value; }
        }

        [JsonProperty("message")]
        public string Message
        {
            get { return _message; }
            set { _message = value; }
        }

        [JsonProperty("class")]
        public string ClassName
        {
            get { return _className; }
            set { _className = value; }
        }

        [JsonProperty("screen")]
        public string Screenshot
        {
            //TODO: (JimEvans) Change this to return an Image.
            get { return _screenshot; }
            set { _screenshot = value; }
        }

        [JsonProperty("stackTrace")]
        public StackTraceElement[] StackTrace
        {
            get { return _stackTrace; }
            set { _stackTrace = value; }
        }
    }
}
