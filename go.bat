@echo off
SETLOCAL EnableDelayedExpansion

REM we want jruby-complete to take care of all things ruby
SET GEM_HOME=
SET GEM_PATH=

# This code supports both:
# ./go "namespace:task[--arg1,--arg2]" --rake-flag
# ./go namespace:task --arg1 --arg2 -- --rake-flag

REM The first argument is always the Rake task name
SET task=%1

REM Check for arguments
IF "%task%"=="" (
  echo No task specified
  exit /b 1
)

REM Shift the task off
SHIFT

REM Leave task alone if already passing in arguments the normal way
ECHO %task% | FINDSTR /C:"[" >NUL
IF %ERRORLEVEL% EQU 0 (
  GOTO execute_with_args
)

REM Initialize variables for task arguments and rake flags
SET task_args=
SET rake_flags=
SET separator_found=false

REM Process arguments until we find --
:process_args
IF "%1"=="" GOTO done_args

IF "%1"=="--" (
  SET separator_found=true
  SHIFT
  GOTO collect_rake_flags
)

REM Add to task arguments
IF "!task_args!"=="" (
  SET task_args=%1
) ELSE (
  SET task_args=!task_args!,%1
)
SHIFT
GOTO process_args

REM Collect remaining arguments as rake flags
:collect_rake_flags
IF "%1"=="" GOTO done_args
IF "!rake_flags!"=="" (
  SET rake_flags=%1
) ELSE (
  SET rake_flags=!rake_flags! %1
)
SHIFT
GOTO collect_rake_flags

:done_args
REM If we have task args, format them as task[arg1,arg2,...]
IF NOT "!task_args!"=="" (
  SET task=%task%[!task_args!]
  ECHO Executing rake task: %task%
)

:execute
REM Execute rake with the task and flags
java %JAVA_OPTS% -jar third_party\jruby\jruby-complete.jar -X-C -S rake %task% %rake_flags%
GOTO :EOF

:execute_with_args
REM Task already has arguments in brackets, pass remaining args directly to rake
java %JAVA_OPTS% -jar third_party\jruby\jruby-complete.jar -X-C -S rake %task% %*
