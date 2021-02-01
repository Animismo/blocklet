/* eslint-disable prefer-destructuring */
/* eslint-disable object-curly-newline */
import React from 'react';
import { create } from '@arcblock/ux/lib/Theme';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import CircularProgress from '@material-ui/core/CircularProgress';
import Center from '@arcblock/ux/lib/Center';

import HomePage from './pages/index';

import { getWebWalletUrl } from './libs/util';
import { SessionProvider } from './libs/session';

const theme = create();

const GlobalStyle = createGlobalStyle`
  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }

  ul, li {
    padding: 0;
    margin: 0;
    list-style: none;
  }
`;

let apiPrefix = '/';
if (window.blocklet && window.blocklet.prefix) {
  apiPrefix = window.blocklet.prefix;
} else if (window.env && window.env.apiPrefix) {
  apiPrefix = window.env.apiPrefix;
}

export const App = () => {
  const webWalletUrl = getWebWalletUrl();
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <SessionProvider
          serviceHost={apiPrefix}
          webWalletUrl={webWalletUrl}
        >
          {({ session }) => {
            if (session.loading) {
              return (
                <Center>
                  <CircularProgress />
                </Center>
              );
            }

            if (session.user) {
              return (
                <React.Fragment>
                  <CssBaseline />
                  <GlobalStyle />
                  <div className="wrapper">
                    <Switch>
                      <Route exact path="/" component={HomePage} />
                      <Redirect to="/" />
                    </Switch>
                  </div>
                </React.Fragment>
              );
            }

            return null;
          }}
        </SessionProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

const WrappedApp = withRouter(App);

export default () => {
  let basename = '/';
  if (window.env && window.env.apiPrefix) {
    basename = window.env.apiPrefix.indexOf('.netlify/') > -1 ? '/' : window.env.apiPrefix;
  }
  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }
  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
