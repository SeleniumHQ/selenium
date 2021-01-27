import red from '@material-ui/core/colors/red';
import {createMuiTheme} from '@material-ui/core/styles';
import typography from './typography';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#615E9B',
    },
    secondary: {
      main: '#F7F8F8',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  typography
});

export default theme;
