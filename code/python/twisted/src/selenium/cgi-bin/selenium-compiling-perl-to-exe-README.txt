To compile CGIProxy into its own self-contained executable (aka PerlApp, Perl2Exe) do the following:

1) Install Perl -> http://www.activestate.com/Products/Download/Download.plex?id=ActivePerl
2) Install PAR:
   c:\> ppm
   ppm> install PAR

3) Open a command prompt, change dirs to this directory
4) Enter this command:
   pp -o nph-proxy.exe nph-proxy.cgi
