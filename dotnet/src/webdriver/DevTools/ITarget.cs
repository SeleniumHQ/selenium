using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public interface ITarget
    {
        Task<List<TargetInfo>> GetTargets();

        Task<string> AttachToTarget(string TargetId);

        Task SetAutoAttach();
    }
}