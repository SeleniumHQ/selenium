using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public class Response
    {
        private bool responseIsError;
        private object responseValue;
        private string responseSessionId;
        private string responseContext;

        public Response()
        {
        }

        public Response(SessionId sessionId, Context context)
        {
            responseSessionId = sessionId.ToString();
            responseContext = context.ToString();
        }

        [JsonProperty("error")]
        public bool IsError
        {
            get { return responseIsError; }
            set { responseIsError = value; }
        }

        [JsonConverter(typeof(ResponseValueJsonConverter))]
        [JsonProperty("value")]
        public object Value
        {
            get { return responseValue; }
            set { responseValue = value; }
        }

        [JsonProperty("sessionId")]
        public string SessionId
        {
            get { return responseSessionId; }
            set { responseSessionId = value; }
        }

        [JsonProperty("context")]
        public string Context
        {
            get { return responseContext; }
            set { responseContext = value; }
        }

        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "({0} {1} {2}: {3})", SessionId, Context, IsError, Value);
        }
    }
}
