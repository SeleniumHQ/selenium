using System;
using System.Reflection;

public class Reflector
{
   public static void Main(string[] args)
   {
      Console.Error.WriteLine(args[0]);
      Console.WriteLine(AssemblyName.GetAssemblyName(args[0]));
   }
}
