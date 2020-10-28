using OpenQA.Selenium.DevTools.V84.Target;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V84
{

    public class V84Target : ITarget
    {
        private TargetAdapter adapter;

        public V84Target(TargetAdapter adapter)
        {
            this.adapter = adapter;
        }

        public async Task<List<TargetInfo>> GetTargets()
        {
            List<TargetInfo> targets = new List<TargetInfo>();
            var response = await adapter.GetTargets();
            for (int i = 0; i < response.TargetInfos.Length; i++)
            {
                var targetInfo = response.TargetInfos[i];
                var mapped = new TargetInfo()
                {
                    TargetId = targetInfo.TargetId,
                    Title = targetInfo.Title,
                    Type = targetInfo.Type,
                    Url = targetInfo.Url,
                    OpenerId = targetInfo.OpenerId,
                    BrowserContextId = targetInfo.BrowserContextId,
                    IsAttached = targetInfo.Attached
                };
                targets.Add(mapped);
            }

            return targets;
        }

        public async Task<string> AttachToTarget(string targetId)
        {
            var result = await adapter.AttachToTarget(new AttachToTargetCommandSettings() { TargetId = targetId, Flatten = true });
            return result.SessionId;
        }

        public async Task SetAutoAttach()
        {
            await adapter.SetAutoAttach(new SetAutoAttachCommandSettings() { AutoAttach = true, WaitForDebuggerOnStart = false, Flatten = true });
        }
    }
}
