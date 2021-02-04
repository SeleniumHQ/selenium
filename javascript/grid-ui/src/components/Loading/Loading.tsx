import * as React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import {Box, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.secondary.main,
      height: '100%',
      paddingTop: theme.spacing(1),
      width: '100%',
      justifyContent: "center",
    },
  }),
);

export default function Loading() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box mb={2}>
        <Typography
          align="center"
          color="textPrimary"
          variant="h3"
        >
          Loading...
        </Typography>
      </Box>
      <LinearProgress/>
    </div>
  );
}
