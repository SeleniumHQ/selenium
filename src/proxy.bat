@echo off

rem This script will create a 'local' copy of the se-ide extension which you can
rem then point to using the proxy trick described at http://wiki.openqa.org/display/SIDE/Building+Selenium+IDE
rem But, before you run it, you need to do a 'mvn clean install' to get the
rem external dependencies moved into the right spots

setlocal

set ROOT_DIR=%CD%
set TMP_DIR="build"

rem remove any left-over files from previous build
del /S /Q /F %TMP_DIR%

mkdir %TMP_DIR%\content

robocopy content %TMP_DIR%\content /E /XD .svn selenium-tests tests
robocopy locale %TMP_DIR%\locale /E /XD .svn
robocopy skin %TMP_DIR%\skin /E /XD .svn
robocopy components %TMP_DIR%\components /E /XD .svn
robocopy content-files %TMP_DIR%\content-files /E /XD .svn
copy install.rdf %TMP_DIR%
copy chrome.manifest %TMP_DIR%

endlocal