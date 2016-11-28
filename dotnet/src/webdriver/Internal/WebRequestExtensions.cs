#if NETSTANDARD1_5
using System;
using System.IO;
using System.Net;

namespace WebDriver.Internal
{
    internal static class WebRequestExtensions
    {
        public static WebResponse GetResponse(this WebRequest request)
        {
            try
            {
                return request.GetResponseAsync().Result;
            }
            catch (AggregateException ex)
            {
                throw ex.GetBaseException();
            }
        }

        public static Stream GetRequestStream(this WebRequest request)
        {
            try
            {
                return request.GetRequestStreamAsync().Result;
            }
            catch (AggregateException ex)
            {
                throw ex.GetBaseException();
            }
        }
    }
}
#endif
