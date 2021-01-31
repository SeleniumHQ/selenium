import React from 'react';
import {createStyles, lighten, makeStyles, Theme} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {loader} from "graphql.macro";
import {useQuery} from "@apollo/client";
import {GridConfig} from "../../config";
import chromeLogo from "../../assets/browsers/chrome.svg";
import edgeLogo from "../../assets/browsers/edge.svg";
import operaLogo from "../../assets/browsers/opera.svg";
import firefoxLogo from "../../assets/browsers/firefox.svg";
import internetExplorerLogo from "../../assets/browsers/internet-explorer.svg";
import safariLogo from "../../assets/browsers/safari.svg";
import safariTechnologyPreviewLogo from "../../assets/browsers/safari-technology-preview.png";
import unknownBrowserLogo from "../../assets/browsers/unknown.svg";
import macLogo from "../../assets/operating-systems/mac.svg";
import windowsLogo from "../../assets/operating-systems/windows.svg";
import linuxLogo from "../../assets/operating-systems/linux.svg";
import unknownOsLogo from "../../assets/operating-systems/unknown.svg";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";

interface SessionData {
  id: string,
  rawCapabilities: string,
  browserName: string,
  browserVersion: string,
  platformName: string,
  startTime: string,
  uri: string,
  nodeId: string,
  nodeUri: string,
  sessionDurationMillis: number,
  slot: any,
}

function createSessionData(
  id: string,
  rawCapabilities: string,
  startTime: string,
  uri: string,
  nodeId: string,
  nodeUri: string,
  sessionDurationMillis: number,
  slot: any,
): SessionData {
  const parsedCapabilities = JSON.parse(rawCapabilities);
  const browserName = parsedCapabilities.browserName;
  const browserVersion = parsedCapabilities.browserVersion ?? parsedCapabilities.version;
  const platformName = parsedCapabilities.platformName ?? parsedCapabilities.platform;
  return {
    id,
    rawCapabilities,
    browserName,
    browserVersion,
    platformName,
    startTime,
    uri,
    nodeId,
    nodeUri,
    sessionDurationMillis,
    slot
  };
}

const browserLogoPath = (browser: string): string => {
  switch (browser.toLowerCase()) {
    case "chrome":
      return chromeLogo;
    case "microsoftedge":
      return edgeLogo;
    case "operablink":
      return operaLogo;
    case "opera":
      return operaLogo;
    case "firefox":
      return firefoxLogo;
    case "internet explorer":
      return internetExplorerLogo;
    case "safari":
      return safariLogo;
    case "safari technology preview":
      return safariTechnologyPreviewLogo;
    default:
      return unknownBrowserLogo;
  }
};

const browserVersion = (version: string): string => {
  return version.length > 0 ? " - v." + version : version;
}

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

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof SessionData;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {id: 'id', numeric: false, disablePadding: false, label: 'ID'},
  {id: 'rawCapabilities', numeric: false, disablePadding: false, label: 'Capabilities'},
  {id: 'startTime', numeric: false, disablePadding: false, label: 'Start time'},
  {id: 'sessionDurationMillis', numeric: true, disablePadding: false, label: 'Duration'},
  {id: 'nodeUri', numeric: false, disablePadding: false, label: 'Node URI'},
];

const GRID_SESSIONS_QUERY = loader("../../graphql/sessions.gql");

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof SessionData) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {classes, order, orderBy, onRequestSort} = props;
  const createSortHandler = (property: keyof SessionData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
    title: {
      flex: '1 1 100%',
    },
  }),
);

const EnhancedTableToolbar = () => {
  const classes = useToolbarStyles();

  return (
    <Toolbar
      className={classes.root}
    >
      <Typography className={classes.title} variant="h3" id="tableTitle" component="div">
        Sessions
      </Typography>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    logo: {
      width: 24,
      height: 24,
      marginBottom: 5,
      marginRight: 5,
    },
    buttonMargin: {
      padding: 1,
    }
  }),
);

export default function Sessions() {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof SessionData>('startTime');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rowOpen, setRowOpen] = React.useState("");
  const handleDialogOpen = (rowId: string) => {
    setRowOpen(rowId);
  };
  const handleDialogClose = () => {
    setRowOpen("");
  };

  const {loading, error, data} = useQuery(GRID_SESSIONS_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  const rows = data.grid.sessions.map((session) => {
    return createSessionData(
      session.id,
      session.capabilities,
      session.startTime,
      session.uri,
      session.nodeId,
      session.nodeUri,
      session.sessionDurationMillis,
      session.slot,
    );
  });

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof SessionData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar/>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id as string);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id as string)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell component="th" id={labelId} scope="row">
                        {row.id}
                      </TableCell>
                      <TableCell align="right">
                        <img
                          src={osLogoPath(row.platformName as string)}
                          className={classes.logo}
                          alt="OS Logo"
                        />
                        <img
                          src={browserLogoPath(row.browserName as string)}
                          className={classes.logo}
                          alt="Browser Logo"
                        />
                        {browserVersion(row.browserVersion as string)}
                        <IconButton className={classes.buttonMargin} onClick={() => handleDialogOpen(row.id as string)}>
                          <InfoIcon/>
                        </IconButton>
                        <Dialog onClose={handleDialogClose} aria-labelledby="session-info-dialog"
                                open={rowOpen === row.id}>
                          <DialogTitle id="session-info-dialog">
                            <img
                              src={osLogoPath(row.platformName as string)}
                              className={classes.logo}
                              alt="OS Logo"
                            />
                            <img
                              src={browserLogoPath(row.browserName as string)}
                              className={classes.logo}
                              alt="Browser Logo"
                            />
                            {browserVersion(row.browserVersion as string)}
                          </DialogTitle>
                          <DialogContent dividers>
                            <Typography gutterBottom>
                              Capabilities:
                            </Typography>
                            <Typography gutterBottom>
                              <pre>
                                {JSON.stringify(JSON.parse(row.rawCapabilities as string), null, 2)}
                              </pre>
                            </Typography>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleDialogClose} color="primary" variant="outlined">
                              Close
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                      <TableCell align="right">{row.startTime}</TableCell>
                      <TableCell align="right">{row.sessionDurationMillis}</TableCell>
                      <TableCell align="right">{row.nodeUri}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{height: (dense ? 33 : 53) * emptyRows}}>
                  <TableCell colSpan={6}/>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense}/>}
        label="Dense padding"
      />
    </div>
  );
}
