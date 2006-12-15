#!/usr/bin/perl
use strict;
use warnings;
use LWP::Simple;
use Archive::Zip qw(:ERROR_CODES :CONSTANTS);
use File::Copy qw/copy/;
use File::Path qw/rmtree/;

my $selenium_core_url = 'http://release.openqa.org/selenium-core/nightly/selenium-core-0.8.3-SNAPSHOT.zip';
my $core_dir = fetch_and_extract($selenium_core_url);
my $core_iedoc = "$core_dir/core/iedoc.xml";
die "Can't find $core_iedoc" unless -e $core_iedoc;
print "Copying $core_iedoc to iedoc.xml...\n";
copy($core_iedoc => 'iedoc.xml') or die "Can't copy $core_iedoc to iedoc.xml: $!";
exit;


sub fetch_and_extract {
    my $url = shift;
    (my $zip_file = $url) =~ s#.+/##;
    unless (-e $zip_file) {
            print "Fetching $url...\n";
            getstore($url, $zip_file);
            die "Couldn't fetch $url!" unless -e $zip_file;
    }

    print "Reading $zip_file...\n";
    my $zip = Archive::Zip->new;
    unless ($zip->read($zip_file) == AZ_OK) {
            die "Failed to read $zip_file";
    }

    (my $src_dir = $zip_file) =~ s#\.zip$##;
    if (-d $src_dir) {
            print "Removing old $src_dir...\n";
            rmtree $src_dir;
    }
    print "Extracting to $src_dir...\n";
    $zip->extractTree;
    return $src_dir;
} 
