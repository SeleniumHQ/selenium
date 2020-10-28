using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public interface INetwork
    {
        Task EnableNetworkCaching();
        Task DisableNetworkCaching();
        Task EnableFetchForAllPatterns();
        Task DisableFetch();

        Task ContinueWithoutModification(HttpRequestData requestData);
        Task ContinueWithAuth(HttpRequestData requestData, string userName, string password);
        Task CancelAuth(HttpRequestData requestData);
        Task ContinueRequest(HttpRequestData requestData, HttpResponseData responseData);

        event EventHandler<AuthRequiredEventArgs> AuthRequired;
        event EventHandler<RequestPausedEventArgs> RequestPaused;
    }
}