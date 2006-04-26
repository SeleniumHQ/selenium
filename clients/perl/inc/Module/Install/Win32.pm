#line 1
package Module::Install::Win32;

use strict;
use Module::Install::Base;

use vars qw{$VERSION @ISA};
BEGIN {
	$VERSION = '0.61';
	@ISA     = qw{Module::Install::Base};
}

# determine if the user needs nmake, and download it if needed
sub check_nmake {
	my $self = shift;
	$self->load('can_run');
	$self->load('get_file');
	
	require Config;
	return unless (
		$^O eq 'MSWin32'                     and
		$Config::Config{make}                and
		$Config::Config{make} =~ /^nmake\b/i and
		! $self->can_run('nmake')
	);

	print "The required 'nmake' executable not found, fetching it...\n";

	require File::Basename;
	my $rv = $self->get_file(
		url       => 'http://download.microsoft.com/download/vc15/Patch/1.52/W95/EN-US/Nmake15.exe',
		ftp_url   => 'ftp://ftp.microsoft.com/Softlib/MSLFILES/Nmake15.exe',
		local_dir => File::Basename::dirname($^X),
		size      => 51928,
		run       => 'Nmake15.exe /o > nul',
		check_for => 'Nmake.exe',
		remove    => 1,
	);

	if (!$rv) {
        die <<'END_MESSAGE';

-------------------------------------------------------------------------------

Since you are using Microsoft Windows, you will need the 'nmake' utility
before installation. It's available at:

  http://download.microsoft.com/download/vc15/Patch/1.52/W95/EN-US/Nmake15.exe
      or
  ftp://ftp.microsoft.com/Softlib/MSLFILES/Nmake15.exe

Please download the file manually, save it to a directory in %PATH% (e.g.
C:\WINDOWS\COMMAND\), then launch the MS-DOS command line shell, "cd" to
that directory, and run "Nmake15.exe" from there; that will create the
'nmake.exe' file needed by this module.

You may then resume the installation process described in README.

-------------------------------------------------------------------------------
END_MESSAGE
	}
}

1;
