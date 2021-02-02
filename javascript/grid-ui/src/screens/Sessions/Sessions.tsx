import * as React from 'react';
import RunningSessions from "../../components/RunningSessions/RunningSessions";
import {useQuery} from "@apollo/client";
import {loader} from "graphql.macro";
import {GridConfig} from "../../config";
import Grid from "@material-ui/core/Grid";
import QueuedSessions from "../../components/QueuedSessions/QueuedSessions";
import NoData from "../../components/NoData/NoData";


const GRID_SESSIONS_QUERY = loader("../../graphql/sessions.gql");

export default function Sessions() {

  const {loading, error, data} = useQuery(GRID_SESSIONS_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  if (data.sessionsInfo.sessionQueueRequests.length === 0 && data.sessionsInfo.sessions.length === 0) {
    const shortMessage = "There are no running or queued sessions at the moment.";
    return (
      <Grid container spacing={3}>
        <NoData message={shortMessage}/>
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      <QueuedSessions sessionQueueRequests={data.sessionsInfo.sessionQueueRequests}/>
      <RunningSessions sessions={data.sessionsInfo.sessions}/>
    </Grid>
  );
}
