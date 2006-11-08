package SeleniumUtil;
use strict;
use warnings;
use base 'Exporter';
our @EXPORT_OK = qw(server_is_running);

use IO::Socket;

=for pod

=head1

Put utility testing code here.

=head2 server_is_running

Returns true if a Selenium server is running.

Environment vars SRC_HOST and SRC_PORT can override the server to check on.

=cut

sub server_is_running {
    return IO::Socket::INET->new(PeerAddr => $ENV{SRC_HOST} || 'localhost',
                                 PeerPort => $ENV{SRC_PORT} || 4444,
                                );
}

1;
