import os
import sys
import shutil
import unittest

BUILD_DIR = 'build'
DIST_DIR = 'dist'

def main():

    clean = False
    exe = False
    installer = False
    test = False
    
    args = sys.argv[1:]
    
    if args:
        for arg in args:
            if arg == 'clean':
                clean = True
            if arg == 'exe':
                exe = True
            if arg == 'installer':
                installer = True
            if arg == 'test':
                test = True
            if arg == 'all':
                clean = test = exe = installer = True
    else:
        print 'Usage: build.py [clean] [test] [exe] [installer] [all]'
    
    if clean:
        doClean()
    
    if test:
        doTest()
        
    if exe:
        buildEXE()
    
    if installer:
        buildInstaller()

def buildEXE():
    os.system('c:\\Python23\\python.exe setup.py py2exe')
    
def buildInstaller():
    os.system('"C:\\Program Files\\NSIS\makensis.exe" config/installer.nsi')
    
def doClean():
    removeFile('Setup.exe')
    removeDir(BUILD_DIR)
    removeDir(DIST_DIR)

def doTest():
    """ Unit tests from Plone version need to be ported over here"""
    pass # :-) really nice for a testing tool, heh?    
    
def removeDir(path):
    if os.path.exists(path):
        shutil.rmtree(path)

def removeFile(path):
    if os.path.exists(path):
        os.remove(path)
        
if __name__ == '__main__':
    main()    