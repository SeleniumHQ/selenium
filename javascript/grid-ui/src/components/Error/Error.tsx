import * as React from 'react';
import {Box, Container, Typography} from "@material-ui/core";
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

export default function Error(props) {
  const classes = useStyles();
  const {message, errorMessage} = props;

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
          <Box mb={3}>
            <Typography
              align="center"
              color="textPrimary"
              variant="h3"
            >
              {message}
            </Typography>
          </Box>
          <Typography
            align="center"
            color="textPrimary"
            variant="h4"
            component={"span"}
          >
            <pre>
              {errorMessage}
            </pre>
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
