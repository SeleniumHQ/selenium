import * as React from 'react';
import RunningSessions from "../../components/RunningSessions/RunningSessions";
import {useQuery} from "@apollo/client";
import {loader} from "graphql.macro";
import {GridConfig} from "../../config";
import Grid from "@material-ui/core/Grid";
import QueuedSessions from "../../components/QueuedSessions/QueuedSessions";
import NoData from "../../components/NoData/NoData";
import Loading from "../../components/Loading/Loading";
import Error from "../../components/Error/Error";


const GRID_SESSIONS_QUERY = loader("../../graphql/sessions.gql");

export default function Sessions() {

  const {loading, error, data} = useQuery(GRID_SESSIONS_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) {
    return (
      <Grid container spacing={3}>
        <Loading/>
      </Grid>
    );
  }

  if (error) {
    const message = "There has been an error while loading the running and queued Sessions from the Grid."
    return (
      <Grid container spacing={3}>
        <Error message={message} errorMessage={error.message}/>
      </Grid>
    )
  }
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
      <RunningSessions sessions={data.sessionsInfo.sessions}/>
      <QueuedSessions sessionQueueRequests={data.sessionsInfo.sessionQueueRequests}/>
    </Grid>
  );
}
