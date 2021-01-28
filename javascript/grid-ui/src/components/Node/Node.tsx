import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  GridSize,
  IconButton,
  makeStyles,
  Typography
} from '@material-ui/core';
import * as React from 'react';
import chromeLogo from "../../assets/browsers/chrome.svg";
import edgeLogo from "../../assets/browsers/edge.svg";
import operaBlinkLogo from "../../assets/browsers/opera.svg";
import firefoxLogo from "../../assets/browsers/firefox.svg";
import safariLogo from "../../assets/browsers/safari.svg";
import safariTechnologyPreviewLogo from "../../assets/browsers/safari-technology-preview.png";
import unknownBrowserLogo from "../../assets/browsers/unknown.svg";
import macLogo from "../../assets/operating-systems/mac.svg";
import windowsLogo from "../../assets/operating-systems/windows.svg";
import linuxLogo from "../../assets/operating-systems/linux.svg";
import unknownOsLogo from "../../assets/operating-systems/unknown.svg";
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
  buttonMargin: {
    padding: 1,
  }
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
      return unknownBrowserLogo;
  }
};

const osLogoPath = (os: string): string => {
  const osLowerCase: string = os.toLowerCase();
  if (osLowerCase.includes("win")) {
    return windowsLogo;
  }
  if (osLowerCase.includes("mac")) {
    return macLogo;
  }
  if (osLowerCase.includes("nix") || osLowerCase.includes("nux") || osLowerCase.includes("aix")) {
    return linuxLogo;
  }
  return unknownOsLogo;
};

export default function Node(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleDialogOpen = () => {
    setOpen(true);
  };
  const handleDialogClose = () => {
    setOpen(false);
  };
  const nodeInfo: NodeType = props.node;
  const sessionCount = nodeInfo.sessionCount ?? 0;
  const currentLoad = sessionCount / nodeInfo.maxSession;
  // Assuming we will put 3 stereotypes per column.
  const stereotypeColumns = Math.round(nodeInfo.slotStereotypes.length / 3);
  // Then we need to know how many columns we will display.
  const columnWidth: GridSize = 12 / stereotypeColumns as any;

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
                {nodeInfo.uri}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                  color="textPrimary"
                  gutterBottom
                  variant="h6"
              >
                <img
                    src={osLogoPath(nodeInfo.osInfo.name)}
                    className={classes.osLogo}
                    alt="OS Logo"
                />
                <IconButton className={classes.buttonMargin} onClick={handleDialogOpen}>
                  <InfoIcon/>
                </IconButton>
                <Dialog onClose={handleDialogClose} aria-labelledby="node-info-dialog" open={open}>
                  <DialogTitle id="node-info-dialog">
                    <img
                        src={osLogoPath(nodeInfo.osInfo.name)}
                        className={classes.osLogo}
                        alt="OS Logo"
                    />
                    <Box fontWeight="fontWeightBold" mr={1} display='inline'>
                      URI:
                    </Box>
                    {nodeInfo.uri}
                  </DialogTitle>
                  <DialogContent dividers>
                    <Typography gutterBottom>
                      OS Arch: {nodeInfo.osInfo.arch}
                    </Typography>
                    <Typography gutterBottom>
                      OS Name: {nodeInfo.osInfo.name}
                    </Typography>
                    <Typography gutterBottom>
                      OS Version: {nodeInfo.osInfo.version}
                    </Typography>
                    <Typography gutterBottom>
                      Total slots: {nodeInfo.slotCount}
                    </Typography>
                    <Typography gutterBottom>
                      Grid version: {nodeInfo.version}
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleDialogClose} color="primary" variant="outlined">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
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
                  <Box pt={1} mt={2}>
                    <Typography
                        variant="body2"
                        gutterBottom
                    >
                      Load: {currentLoad}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box pt={1} mt={2}>
                    <Typography
                        variant="body2"
                        gutterBottom
                    >
                      Max. Concurrency: {props.node.maxSession}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Box pt={1} mt={2}>
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


