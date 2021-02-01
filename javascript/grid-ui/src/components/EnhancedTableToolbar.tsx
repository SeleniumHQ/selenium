import * as React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';


const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    title: {
      flex: '1 1 100%',
    },
  }),
);

export default function EnhancedTableToolbar(props) {
  const classes = useToolbarStyles();
  const {title} = props;
  return (
    <Toolbar
      className={classes.root}
    >
      <Typography className={classes.title} variant="h3" id="tableTitle" component="div">
        {title}
      </Typography>
    </Toolbar>
  );
}
