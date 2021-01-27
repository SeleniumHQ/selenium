import {Box, Card, CardContent, Grid, GridSize, makeStyles, Typography} from '@material-ui/core';
import * as React from 'react';
import chromeLogo from "../../assets/browsers/chrome.svg";
import edgeLogo from "../../assets/browsers/edge.svg";
import operaBlinkLogo from "../../assets/browsers/opera.svg";
import firefoxLogo from "../../assets/browsers/firefox.svg";
import safariLogo from "../../assets/browsers/safari.svg";
import safariTechnologyPreviewLogo from "../../assets/browsers/safari.svg";
import InfoIcon from '@material-ui/icons/Info';
import NodeType from "../../models/node";

const useStyles = makeStyles({
  root: {
    height: '100%',
    flexGrow: 1,
  },
  paddingContent: {
    paddingRight: 10,
    paddingLeft: 10,
  },
  osLogo: {
    width: 32,
    height: 32,
    marginRight: 5,
  },
  browserLogo: {
    width: 24,
    height: 24,
    marginTop: 5,
    marginRight: 5,
  },
});

const browserLogoPath = (browser: string): string => {
  switch (browser) {
    case "chrome":
      return chromeLogo;
    case "MicrosoftEdge":
      return edgeLogo;
    case "operablink":
      return operaBlinkLogo;
    case "firefox":
      return firefoxLogo;
    case "safari":
      return safariLogo;
    case "Safari Technology Preview":
      return safariTechnologyPreviewLogo;
    default:
      return "";
  }
};


export default function Node(props) {
  const classes = useStyles();
  const nodeInfo: NodeType = props.node;
  const sessionCount = nodeInfo.sessionCount ?? 0;
  const currentLoad = sessionCount / nodeInfo.maxSession;
  // Assuming we will put 3 stereotypes per column.
  const stereotypeColumns = Math.round(nodeInfo.slotStereotypes.length / 3);
  // Then we need to know how many columns we will display.
  const columnWidth: GridSize = 6;
  // const columnWidth = 12 / 12;

  return (
      <Card
          className={classes.root}
      >
        <CardContent className={classes.paddingContent}>
          <Grid
              container
              justify="space-between"
              spacing={1}
          >
            <Grid item xs={10}>
              <Typography
                  color="textPrimary"
                  gutterBottom
                  variant="h6"
              >
                <Box fontWeight="fontWeightBold" mr={1} display='inline'>
                  URI:
                </Box>
                {props.node.uri}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                  color="textPrimary"
                  gutterBottom
                  variant="h6"
              >
                {/*TODO: User proper logos after getting OS info from backend*/}
                <img
                    src={chromeLogo}
                    className={classes.osLogo}
                    alt="OS Logo"
                />
                <InfoIcon/>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                  color="textPrimary"
                  gutterBottom
                  variant="h6"
              >
                <Box fontWeight="fontWeightBold" mr={1} display='inline'>
                  Stereotypes
                </Box>
              </Typography>
              <Grid
                  container
                  justify="space-between"
                  spacing={2}
              >
                {
                  Array.from(Array(stereotypeColumns).keys()).map((index) => {
                    return (
                        <Grid item xs={columnWidth} key={index}>
                          {
                            nodeInfo.slotStereotypes
                                .slice(index * 3, Math.min((index * 3) + 3, nodeInfo.slotStereotypes.length))
                                .map((slotStereotype: any, idx) => {
                                  console.log(slotStereotype)
                                  return (<Typography
                                          color="textPrimary"
                                          variant="h6"
                                          key={idx}
                                      >
                                        <img
                                            src={browserLogoPath(slotStereotype.stereotype.browserName)}
                                            className={classes.browserLogo}
                                            alt="Browser Logo"
                                        />
                                        {slotStereotype.slots}
                                      </Typography>
                                  )
                                })}
                        </Grid>
                    )
                  })
                }
              </Grid>
              <Grid
                  container
                  justify="space-between"
                  spacing={2}
              >
                <Grid item xs={3}
                >
                  <Box pt={2} mt={2}>
                    <Typography
                        variant="body2"
                        gutterBottom
                    >
                      Load: {currentLoad}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box pt={2} mt={2}>
                    <Typography
                        variant="body2"
                        gutterBottom
                    >
                      Max. Concurrency: {props.node.maxSession}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Box pt={2} mt={2}>
                    <Typography
                        color="textPrimary"
                        gutterBottom
                        variant="caption"
                    >
                      {props.node.version}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
  );
}


