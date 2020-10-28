using OpenQA.Selenium.DevTools.V85.Page;
using OpenQA.Selenium.DevTools.V85.Runtime;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V85
{
    public class V85JavaScript : IJavaScript
    {
        private RuntimeAdapter runtime;
        private PageAdapter page;

        public V85JavaScript(RuntimeAdapter runtime, PageAdapter page)
        {
            this.runtime = runtime;
            this.page = page;
            this.runtime.BindingCalled += OnRuntimeBindingCalled;
            this.runtime.ConsoleAPICalled += OnRuntimeConsoleApiCalled;
            this.runtime.ExceptionThrown += OnRuntimeExceptionThrown;
        }

        public event EventHandler<BindingCalledEventArgs> BindingCalled;
        public event EventHandler<ConsoleApiCalledEventArgs> ConsoleApiCalled;
        public event EventHandler<ExceptionThrownEventArgs> ExceptionThrown;

        public async Task EnablePage()
        {
            await page.Enable();
        }

        public async Task DisablePage()
        {
            await page.Disable();
        }

        public async Task EnableRuntime()
        {
            await runtime.Enable();
        }

        public async Task DisableRuntime()
        {
            await runtime.Disable();
        }

        public async Task<string> AddScriptToEvaluateOnNewDocument(string script)
        {
            var result = await page.AddScriptToEvaluateOnNewDocument(new AddScriptToEvaluateOnNewDocumentCommandSettings() { Source = script });
            return result.Identifier;
        }

        public async Task RemoveScriptToEvaluateOnNewDocument(string scriptId)
        {
            await page.RemoveScriptToEvaluateOnNewDocument(new RemoveScriptToEvaluateOnNewDocumentCommandSettings() { Identifier = scriptId });
        }

        public async Task AddBinding(string name)
        {
            await runtime.AddBinding(new AddBindingCommandSettings() { Name = name });
        }

        public async Task RemoveBinding(string name)
        {
            await runtime.RemoveBinding(new RemoveBindingCommandSettings() { Name = name });
        }

        private void OnRuntimeBindingCalled(object sender, Runtime.BindingCalledEventArgs e)
        {
            if (this.BindingCalled != null)
            {
                BindingCalledEventArgs wrapped = new BindingCalledEventArgs()
                {
                    ExecutionContextId = e.ExecutionContextId,
                    Name = e.Name,
                    Payload = e.Payload
                };
                this.BindingCalled(this, wrapped);
            }
        }

        private void OnRuntimeExceptionThrown(object sender, Runtime.ExceptionThrownEventArgs e)
        {
            if (this.ExceptionThrown != null)
            {
                var wrapped = new ExceptionThrownEventArgs()
                {
                    Timestamp = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                    Message = e.ExceptionDetails.Text
                };

                // TODO: Collect stack trace elements
                this.ExceptionThrown(this, wrapped);
            }
        }

        private void OnRuntimeConsoleApiCalled(object sender, ConsoleAPICalledEventArgs e)
        {
            if (this.ConsoleApiCalled != null)
            {
                var wrapped = new ConsoleApiCalledEventArgs()
                {
                    Timestamp = new DateTime(1979, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                    Type = e.Type,
                    Arguments = new List<ConsoleApiArgument>()
                };

                foreach (var arg in e.Args)
                {
                    string argValue = null;
                    if (arg.Value != null)
                    {
                        argValue = arg.Value.ToString();
                    }
                    wrapped.Arguments.Add(new ConsoleApiArgument() { Type = arg.Type.ToString(), Value = argValue });
                }

                this.ConsoleApiCalled(this, wrapped);
            }
        }
    }
}