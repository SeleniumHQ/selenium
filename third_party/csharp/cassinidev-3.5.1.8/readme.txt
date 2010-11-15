This folder contains the CassiniDev-console.exe file used as a web 
server by the .NET unit tests. The project from which this file was
built can be found at http://cassinidev.codeplex.com. The binary
distribution from the project cannot be used directly, as it is 
compiled to the x86 platform. The .NET tests are compiled to use
the AnyCPU platform, and therefore cannot load the executable on
64-bit Windows platforms. Note that this solution has not been
tested on Mono.

To compile this binary, get the latest source code from the
CassiniDev project. This can be one of the source code snapshots
posted on the project website, or can be obtained from the Subversion
source code control at https://cassinidev.svn.codeplex.com/svn.
Building the executable is done using the following steps:

1. Open the project solution file (CassiniDev.sln) in Visual Studio.

2. In the Solution Explorer, Right-click on the CassiniDev.Console
   project and click Properties.

3. In the Properties page, select the Build tab.

4. In the Build tab, change the Platform target setting from 'x86' to 
   'Any CPU' and save.

5. In the Solution Explorer, Right-click on the CassiniDev.Console
   project and click Build.

The CassiniDev-console.exe file should be built in the project build
directory. This file and its accompanying .config file should be
copied into this folder and checked in.
