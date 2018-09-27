IEWebDriverManager contains the COM headers for using the Microsoft WebDriver
implementation for Internet Explorer. It is generated using the .idl located
in this directory, using the MIDL compiler. To generate it, in a Visual Studio
Command Prompt, navigate to this directory, and type the following command:

    midl /notlb /client none /header IEWebDriverManager.h /iid IEWebDriverManagerIds.h IEWebDriver.idl

The MIDL compiler will generate the IEWebDriverManager.h header file, and a
stub IEWebDriver_i.c file. These files should be committed to source control.