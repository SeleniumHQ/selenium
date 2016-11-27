using System.Diagnostics;

namespace WebDriver.Internal
{
    internal static class ProcessStartInfoExtensions
    {
        public static void SetEnvironmentVariable(this ProcessStartInfo startInfo, string name, string value)
        {
#if NETSTANDARD1_5
            if(startInfo.Environment.ContainsKey(name))
            {
                startInfo.Environment[name] = value;
            }
            else
            {
                startInfo.Environment.Add(name, value);
            }
#else
            if (startInfo.EnvironmentVariables.ContainsKey(name))
            {
                startInfo.EnvironmentVariables[name] = value;
            }
            else
            {
                startInfo.EnvironmentVariables.Add(name, value);
            }
#endif
        }
    }
}
