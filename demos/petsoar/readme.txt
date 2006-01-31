-------------------
PetSoar Quick Start
-------------------
 
1) Make sure Apache Ant is installed and configured.
   You can download it from http://ant.apache.org/

2) Clean everything:
   - ant clean

3) Run the tests:
   - ant test

4) To create the database schema:
   - ant update-schema

4) To import some data into database:
   - ant import-data

5) resin.xml must be updated to specify the path of Jikes
   ex: for unix based - <java compiler="/usr/bin/jikes" compiler-args="-g"/>
       for windows based - <java compiler="bin/jikes" compiler-args="-g"/> 

6) Build the application:
   - ant resin
   Note: depending on the version of
         ant you are using, the resin
         process may stay alive even
         after ant has stopped. You
         may need to kill the process
         manually.

7) Go to http://localhost:8099/

8) Login is username "duke", password "duke"
   or create a new account

Type ant -projecthelp for more stuff.


Hope you enjoy it!

Feedback? Email petsoar@atlassian.com

Thanks,
Patrick L, Mike C-B, Ara A and Joe W