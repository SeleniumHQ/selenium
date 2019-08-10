import pytest

with open("pytest.ini", "w") as ini_file:
    ini_file.write("[pytest]\n")
    ini_file.write("addopts = -r=a\n")
    ini_file.write("rootdir = py")
    ini_file.write("python_files = test_*.py *_tests.py\n")

raise SystemExit(pytest.main())
