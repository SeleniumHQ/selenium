import * as React from 'react';
import RunningSessions from "../../components/RunningSessions/RunningSessions";
import {useQuery} from "@apollo/client";
import {loader} from "graphql.macro";
import {GridConfig} from "../../config";
import Grid from "@material-ui/core/Grid";
import QueuedSessions from "../../components/QueuedSessions/QueuedSessions";


const GRID_SESSIONS_QUERY = loader("../../graphql/sessions.gql");

export default function Sessions() {

  const {loading, error, data} = useQuery(GRID_SESSIONS_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  return (
    <Grid container spacing={3}>
      <QueuedSessions sessionQueueRequests={data.grid.sessionQueueRequests}/>
      <RunningSessions sessions={data.grid.sessions}/>
    </Grid>
  );
}
