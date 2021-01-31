import * as React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {List, ListItem} from "@material-ui/core";
import EnhancedTableToolbar from "../EnhancedTableToolbar";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    queueList: {
      minWidth: 750,
      backgroundColor: theme.palette.background.paper,
      marginBottom: 20,
    },
    queueListItem: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: '#e0e0e0',
    },
  }),
);

export default function QueuedSessions(props) {
  const {sessionQueueRequests} = props;
  const classes = useStyles();

  const queue = sessionQueueRequests.map((queuedSession) => {
    return JSON.stringify(JSON.parse(queuedSession));
  });

  return (
    <div className={classes.root}>
      {queue.length > 0 && (
        <div className={classes.queueList}>
          <EnhancedTableToolbar title={`Queue (${queue.length})`}/>
          <List component="nav" aria-label="main mailbox folders">
            {queue.map((queueItem, index) => {
              return (
                <ListItem className={classes.queueListItem} key={index}>
                  <pre>
                    {queueItem}
                  </pre>
                </ListItem>
              )
            })}
          </List>
        </div>
      )}
    </div>
  );
}
