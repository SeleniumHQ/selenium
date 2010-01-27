using OpenQA.Selenium.Remote;
using System;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{

    public class ChromeResponse : Response
    {
        //Status code of -1 indicates value is the ID of a ChromeWebElement
        private int statusCode;

        [JsonProperty("statusCode")]
        public int StatusCode
        {
            get { return statusCode; }
            set { statusCode = value; }
        }

        public override string ToString()
        {
            return string.Format("({0}: {1})", statusCode, Value);
        }
    }

}
