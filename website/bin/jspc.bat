@echo off
if "%OS%" == "Windows_NT" setlocal
rem ---------------------------------------------------------------------------
rem Script to run the Jasper "offline JSP compiler"
rem
rem $Id: jspc.bat,v 1.1 2004/09/27 15:25:58 phammant Exp $
rem ---------------------------------------------------------------------------

rem Guess JASPER_HOME if not defined
if not "%JASPER_HOME%" == "" goto gotHome
set JASPER_HOME=.
if exist "%JASPER_HOME%\bin\jspc.bat" goto okHome
set JASPER_HOME=..
:gotHome
if exist "%JASPER_HOME%\bin\jspc.bat" goto okHome
echo The JASPER_HOME environment variable is not defined correctly
echo This environment variable is needed to run this program
goto end
:okHome

set EXECUTABLE=%JASPER_HOME%\bin\jasper.bat

rem Check that target executable exists
if exist "%EXECUTABLE%" goto okExec
echo Cannot find %EXECUTABLE%
echo This file is needed to run this program
goto end
:okExec

rem Get remaining unshifted command line arguments and save them in the
set CMD_LINE_ARGS=
:setArgs
if ""%1""=="""" goto doneSetArgs
set CMD_LINE_ARGS=%CMD_LINE_ARGS% %1
shift
goto setArgs
:doneSetArgs

call "%EXECUTABLE%" jspc %CMD_LINE_ARGS%

:end
