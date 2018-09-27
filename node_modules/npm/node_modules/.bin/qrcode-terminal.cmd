@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\qrcode-terminal\bin\qrcode-terminal.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\qrcode-terminal\bin\qrcode-terminal.js" %*
)