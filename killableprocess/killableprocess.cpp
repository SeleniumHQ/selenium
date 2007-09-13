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

// This function will get called when someone tries to stop this process
BOOL CtrlHandler(DWORD ctrlType)
{
    // kill the job containing our spawned child and its descendents
    TerminateJobObject(hJob, 79);
    ExitProcess(0L);
    return TRUE;
}

// DGF Commit suicide if user hands us a line in stdout
DWORD WINAPI ThreadProc( LPVOID lpParam )
{
    _TCHAR line[128];
    _getts_s(line, 128);
    CtrlHandler(0L);
    return 0;
}

int _tmain(int argc, _TCHAR* argv[])
{

    // arg[0] is killableprocess.exe, arg[1] should be the executable
    if (argc < 2) {
        printf("You must specify at least one argument");
        return 1;
    }

    // DGF join all of the command line arguments together, wrapped in quotes

    // first, calculate the size of the joined command arg
    // add the sizes of every arg, +3 (open quote, close quote, space)
    // + 1 null
    
    size_t cmdLen = 1;
    for (int i = 1; i < argc; i++) {
        size_t argLen = _tcslen(argv[i]);
        cmdLen += argLen + 3;
    }
    LPTSTR cmd = new TCHAR[cmdLen];
    cmd[0]=L'\0';
    for (int i = 1; i < argc; i++) {
        if (_tcschr(argv[i], L' ') != NULL || _tcschr(argv[i], L'\t') != NULL) {
            // quote the arg, but only if it contains spaces
            _tcscat_s(cmd, cmdLen, L"\"");
            _tcscat_s(cmd, cmdLen, argv[i]);
            _tcscat_s(cmd, cmdLen, L"\" ");
        } else {
            _tcscat_s(cmd, cmdLen, argv[i]);
            _tcscat_s(cmd, cmdLen, L" ");
        }
        // (there will be an extra space at the end; no one will mind)
    }
    //_tprintf(cmd);

    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION jeli;

    ZeroMemory( &si, sizeof(si) );
    si.cb = sizeof(si);
    ZeroMemory( &pi, sizeof(pi) );
    ZeroMemory( &jeli, sizeof(jeli) );

    hJob = CreateJobObject(NULL, NULL);

    // Hopefully, Windows will kill the job automatically if this process dies
    // But beware!  Process Explorer can break this by keeping open a handle to all jobs!
    // http://forum.sysinternals.com/forum_posts.asp?TID=4094
    jeli.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
	SetInformationJobObject(hJob, JobObjectExtendedLimitInformation, &jeli, sizeof(jeli));

    // Start the child process. 
    if( !CreateProcess( NULL,   // No module name (use command line). 
        cmd, // Command line. 
        NULL,             // Process handle not inheritable. 
        NULL,             // Thread handle not inheritable. 
        FALSE,            // Set handle inheritance to FALSE. 
        CREATE_SUSPENDED,                // Suspend so we can add to job
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
    // Close process and thread handles. 
    CloseHandle( pi.hProcess );
    CloseHandle( pi.hThread );
    // Handle Ctrl-C
    SetConsoleCtrlHandler((PHANDLER_ROUTINE) CtrlHandler, TRUE);
    
    // Create a thread to commit suicide on newline
    HANDLE hThread = CreateThread( 
            NULL,              // default security attributes
            0,                 // use default stack size  
            ThreadProc,        // thread function 
            NULL,             // argument to thread function 
            0,                 // use default creation flags 
            NULL);   // returns the thread identifier 
    CloseHandle(hThread);
    
    // Wait until all processes in the job are dead
    JOBOBJECT_BASIC_PROCESS_ID_LIST pidList = { 0 };
    QueryInformationJobObject(hJob, JobObjectBasicProcessIdList, &pidList, sizeof(pidList), NULL);
    while (pidList.NumberOfProcessIdsInList > 0) {
        DWORD pid = pidList.ProcessIdList[0];
        HANDLE hProcess = OpenProcess(SYNCHRONIZE, FALSE, pid);
        WaitForSingleObject(hProcess, INFINITE);
        CloseHandle (hProcess);
        QueryInformationJobObject(hJob, JobObjectBasicProcessIdList, &pidList, sizeof(pidList), NULL);
    }


    return 0;
}