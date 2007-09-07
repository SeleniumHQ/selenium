/*
 * Copyright 2007 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
#include "stdafx.h"

static HANDLE hJob;

BOOL CtrlHandler(DWORD ctrlType)
{
    TerminateJobObject(hJob, 79);
    return FALSE;
}

int _tmain(int argc, _TCHAR* argv[])
{
    if (argc < 2) {
        printf("You must specify at least one argument");
        return 1;
    }
    // DGF join all of the command line arguments together, wrapped in quotes

    // first, calculate the size of the joined command arg
    // add the sizes of every arg, plus 3 characters (open quote, close quote, space) + 1 null
    // (there will be an extra space at the end; no one will mind)
    size_t cmdLen = 1;
    for (int i = 1; i < argc; i++) {
        int argLen = _tcslen(argv[i]);
        cmdLen += argLen + 3;
    }
    LPTSTR cmd = new TCHAR[cmdLen];
    cmd[0]=L'\0';
    for (int i = 1; i < argc; i++) {
        _tcscat_s(cmd, cmdLen, L"\"");
        _tcscat_s(cmd, cmdLen, argv[i]);
        _tcscat_s(cmd, cmdLen, L"\" ");
    }
    //_tprintf(cmd);

    STARTUPINFO si;
    PROCESS_INFORMATION pi;

    ZeroMemory( &si, sizeof(si) );
    si.cb = sizeof(si);
    ZeroMemory( &pi, sizeof(pi) );

    hJob = CreateJobObject(NULL, NULL);

    // Start the child process. 
    if( !CreateProcess( NULL,   // No module name (use command line). 
        cmd, // Command line. 
        NULL,             // Process handle not inheritable. 
        NULL,             // Thread handle not inheritable. 
        FALSE,            // Set handle inheritance to FALSE. 
        CREATE_SUSPENDED,                // No creation flags. 
        NULL,             // Use parent's environment block. 
        NULL,             // Use parent's starting directory. 
        &si,              // Pointer to STARTUPINFO structure.
        &pi )             // Pointer to PROCESS_INFORMATION structure.
    ) 
    {
        printf( "CreateProcess failed (%d).\n", GetLastError() );
        return 1;
    }
    AssignProcessToJobObject(hJob, pi.hProcess);
    ResumeThread(pi.hThread);
    SetConsoleCtrlHandler((PHANDLER_ROUTINE) CtrlHandler, TRUE);
    Sleep(INFINITE);

    // Close process and thread handles. 
    CloseHandle( pi.hProcess );
    CloseHandle( pi.hThread );
    return 0;
}
