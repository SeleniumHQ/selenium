#!/usr/bin/perl -W

use strict;

while (<>) {
	chomp(my $line = $_);

	if ($line eq "" || substr($line, 0, 1) eq '#') {
		print "$line\n";
		next;
	}

	my @parts = split ';', $line, 3;
	if (@parts != 3) {
		print "line garbled: $line\n";
		next;
	}

	my @results = split $parts[1], $parts[2], int($parts[0]);
	print join ";", @results;
	print "\n";
}
