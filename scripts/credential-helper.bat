@echo off
IF NOT "%~1"=="get" EXIT /B 1
SET "TOKEN=%GITHUB_TOKEN%"
IF NOT DEFINED TOKEN SET "TOKEN=%ENGFLOW_GITHUB_TOKEN%"
IF NOT DEFINED TOKEN (
  ECHO {"headers":{}}
  EXIT /B 0
)
ECHO {"headers":{"Authorization":["Bearer %TOKEN%"]}}
