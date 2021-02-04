import * as React from 'react';
import {Box, Container, Link, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    width: '100%',
    justifyContent: "center",
  },
}));

export default function NoData(props) {
  const classes = useStyles();
  const {message} = props;

  // noinspection HtmlUnknownAnchorTarget
  return (
    <div className={classes.root}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <Container maxWidth="md">
          <Typography
            align="center"
            color="textPrimary"
            variant="h1"
          >
            {message}
          </Typography>
          <Typography
            align="center"
            color="textPrimary"
            variant="h4"
          >
            More information about Selenium Grid can be found at the{' '}
            <Link href="#help">
              Help
            </Link>
            {' '}section.
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
