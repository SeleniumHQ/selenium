@echo off
if "%OS%" == "Windows_NT" setlocal
rem ---------------------------------------------------------------------------
rem Script for Jasper compiler
rem
rem Environment Variable Prequisites
rem
rem   JASPER_HOME   May point at your Catalina "build" directory.
rem
rem   JASPER_OPTS   (Optional) Java runtime options used when the "start",
rem                 "stop", or "run" command is executed.
rem
rem   JAVA_HOME     Must point at your Java Development Kit installation.
rem
rem   JAVA_OPTS     (Optional) Java runtime options used when the "start",
rem                 "stop", or "run" command is executed.
rem
rem $Id: jasper.bat,v 1.1 2004/09/27 15:25:58 phammant Exp $
rem ---------------------------------------------------------------------------

rem Guess JASPER_HOME if not defined
if not "%JASPER_HOME%" == "" goto gotHome
set JASPER_HOME=.
if exist "%JASPER_HOME%\bin\jasper.bat" goto okHome
set JASPER_HOME=..
:gotHome
if exist "%JASPER_HOME%\bin\jasper.bat" goto okHome
echo The JASPER_HOME environment variable is not defined correctly
echo This environment variable is needed to run this program
goto end
:okHome

rem Get standard environment variables
if exist "%JASPER_HOME%\bin\setenv.bat" call "%JASPER_HOME%\bin\setenv.bat"

rem Get standard Java environment variables
if exist "%JASPER_HOME%\bin\setclasspath.bat" goto okSetclasspath
echo Cannot find %JASPER_HOME%\bin\setclasspath.bat
echo This file is needed to run this program
goto end
:okSetclasspath
set BASEDIR=%JASPER_HOME%
call "%JASPER_HOME%\bin\setclasspath.bat"

rem Add on extra jar files to CLASSPATH
for %%i in ("%JASPER_HOME%\common\endorsed\*.jar") do call "%JASPER_HOME%\bin\cpappend.bat" %%i
for %%i in ("%JASPER_HOME%\common\lib\*.jar") do call "%JASPER_HOME%\bin\cpappend.bat" %%i
for %%i in ("%JASPER_HOME%\shared\lib\*.jar") do call "%JASPER_HOME%\bin\cpappend.bat" %%i
set CLASSPATH=%CLASSPATH%;%JASPER_HOME%\shared\classes

rem Parse arguments
if ""%1"" == ""jspc"" goto doJspc
echo Usage: jasper ( jspc )
echo Commands:
echo   jspc - Run the offline JSP compiler
goto end
:doJspc
shift

rem Get remaining unshifted command line arguments and save them in the
set CMD_LINE_ARGS=
:setArgs
if ""%1""=="""" goto doneSetArgs
set CMD_LINE_ARGS=%CMD_LINE_ARGS% %1
shift
goto setArgs
:doneSetArgs

%_RUNJAVA% %JAVA_OPTS% %JASPER_OPTS% -Djava.endorsed.dirs="%JAVA_ENDORSED_DIRS%" -classpath "%CLASSPATH%" -Djasper.home="%JASPER_HOME%" org.apache.jasper.JspC %CMD_LINE_ARGS%

:end
