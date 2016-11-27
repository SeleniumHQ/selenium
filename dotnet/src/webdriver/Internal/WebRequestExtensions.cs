#if NETSTANDARD1_5
using System.IO;
using System.Net;

namespace WebDriver.Internal
{
    internal static class WebRequestExtensions
    {
        public static WebResponse GetResponse(this WebRequest request)
        {
            return request.GetResponseAsync().Result;
        }

        public static Stream GetRequestStream(this WebRequest request)
        {
            return request.GetRequestStreamAsync().Result;
        }
    }
}
#endif
