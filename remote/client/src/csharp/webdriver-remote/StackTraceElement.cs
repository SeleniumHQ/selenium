using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public class StackTraceElement
    {
        private string _fileName;
        private string _className;
        private int _lineNumber;
        private string _methodName;
        private bool _nativeMethod;

        [JsonProperty("fileName")]
        public string FileName
        {
            get { return _fileName; }
            set { _fileName = value; }
        }

        [JsonProperty("className")]
        public string ClassName
        {
            get { return _className; }
            set { _className = value; }
        }

        [JsonProperty("lineNumber")]
        public int LineNumber
        {
            get { return _lineNumber; }
            set { _lineNumber = value; }
        }

        [JsonProperty("methodName")]
        public string MethodName
        {
            get { return _methodName; }
            set { _methodName = value; }
        }

        [JsonProperty("nativeMethod")]
        public bool NativeMethod
        {
            get { return _nativeMethod; }
            set { _nativeMethod = value; }
        }

        public StackTraceElement()
        {
        }
    }
}
