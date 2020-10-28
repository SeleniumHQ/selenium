using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public interface IJavaScript
    {
        Task EnableRuntime();
        Task DisableRuntime();

        Task EnablePage();
        Task DisablePage();
        Task AddBinding(string name);
        Task RemoveBinding(string name);
        Task<string> AddScriptToEvaluateOnNewDocument(string script);
        Task RemoveScriptToEvaluateOnNewDocument(string scriptId);

        event EventHandler<BindingCalledEventArgs> BindingCalled;
        event EventHandler<ConsoleApiCalledEventArgs> ConsoleApiCalled;
        event EventHandler<ExceptionThrownEventArgs> ExceptionThrown;
    }
}