import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';
import {loader} from "graphql.macro";
import * as React from 'react';
import Node from "../../components/Node/Node";
import {useQuery} from "@apollo/client";
import NodeType from "../../models/node";
import OsInfoType from "../../models/os-info";
import {GridConfig} from "../../config";
import NoData from "../../components/NoData/NoData";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  title: {
    flexGrow: 1,
    color: theme.palette.secondary.main,
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 280,
  },
}));

const NODES_QUERY = loader("../../graphql/nodes.gql");


export default function Overview() {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const {loading, error, data} = useQuery(NODES_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  const nodes = data.nodesInfo.nodes.map((node) => {
    const osInfo: OsInfoType = {
      name: node.osInfo.name,
      version: node.osInfo.version,
      arch: node.osInfo.arch,
    }
    const slotStereotypes = JSON.parse(node.stereotypes);
    const newNode: NodeType = {
      uri: node.uri,
      id: node.id,
      status: node.status,
      maxSession: node.maxSession,
      slotCount: node.slotCount,
      version: node.version,
      osInfo: osInfo,
      sessionCount: node.sessionCount ?? 0,
      slotStereotypes: slotStereotypes,
    };
    return newNode;
  });

  if (nodes.length === 0) {
    const shortMessage = "The Grid has no registered Nodes yet.";
    return (
      <Grid container spacing={3}>
        <NoData message={shortMessage}/>
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      {/* Nodes */}
      {nodes.map((node, index) => {
        return (
          <Grid item lg={6} sm={12} xl={4} xs={12} key={index}>
            <Paper className={fixedHeightPaper}>
              <Node node={node}/>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  );
}

