@echo off
if "%OS%" == "Windows_NT" setlocal
rem ---------------------------------------------------------------------------
rem Wrapper script for command line tools
rem
rem Environment Variable Prequisites
rem
rem   CATALINA_HOME May point at your Catalina "build" directory.
rem
rem   TOOL_OPTS     (Optional) Java runtime options used when the "start",
rem                 "stop", or "run" command is executed.
rem
rem   JAVA_HOME     Must point at your Java Development Kit installation.
rem
rem   JAVA_OPTS     (Optional) Java runtime options used when the "start",
rem                 "stop", or "run" command is executed.
rem
rem $Id: tool-wrapper.bat,v 1.1 2004/09/27 15:25:58 phammant Exp $
rem ---------------------------------------------------------------------------

rem Guess CATALINA_HOME if not defined
if not "%CATALINA_HOME%" == "" goto gotHome
set CATALINA_HOME=.
if exist "%CATALINA_HOME%\bin\tool-wrapper.bat" goto okHome
set CATALINA_HOME=..
:gotHome
if exist "%CATALINA_HOME%\bin\tool-wrapper.bat" goto okHome
echo The CATALINA_HOME environment variable is not defined correctly
echo This environment variable is needed to run this program
goto end
:okHome

rem Get standard environment variables
if exist "%CATALINA_HOME%\bin\setenv.bat" call "%CATALINA_HOME%\bin\setenv.bat"

rem Get standard Java environment variables
if exist "%CATALINA_HOME%\bin\setclasspath.bat" goto okSetclasspath
echo Cannot find %CATALINA_HOME%\bin\setclasspath.bat
echo This file is needed to run this program
goto end
:okSetclasspath
set BASEDIR=%CATALINA_HOME%
call "%CATALINA_HOME%\bin\setclasspath.bat"

rem Add on extra jar files to CLASSPATH
set CLASSPATH=%CLASSPATH%;%CATALINA_HOME%\bin\bootstrap.jar

rem Get remaining unshifted command line arguments and save them in the
set CMD_LINE_ARGS=
:setArgs
if ""%1""=="""" goto doneSetArgs
set CMD_LINE_ARGS=%CMD_LINE_ARGS% %1
shift
goto setArgs
:doneSetArgs

%_RUNJAVA% %JAVA_OPTS% %TOOL_OPTS% -Djava.endorsed.dirs="%JAVA_ENDORSED_DIRS%" -classpath "%CLASSPATH%" -Dcatalina.home="%CATALINA_HOME%" org.apache.catalina.startup.Tool %CMD_LINE_ARGS%

:end
