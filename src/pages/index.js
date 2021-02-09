/* eslint-disable arrow-parens */
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import DidAuth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';
import Center from '@arcblock/ux/lib/Center';

import Layout from '../components/layout';
import Game from '../components/game';
import { SessionContext } from '../libs/session';
import { getWebWalletUrl } from '../libs/util';

export default function IndexPage() {
  const { session, api } = useContext(SessionContext);
  const { chainId, assetChainId } = window.env;

  const [{ [chainId]: chain, [assetChainId]: assetChain }, setChainInfo] = useState({
    [chainId]: null,
    [assetChainId]: null,
  });

  const [loading, setLoading] = useState(false);

  const [swapOpen, setSwapOpen] = useState(false);

  const refresh = (showLoading = false) => {
    setLoading(!!showLoading);
    api
      .get('/api/did/user')
      .then((res) => {
        setLoading(false);
        setChainInfo(res.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onSwapClose = () => setSwapOpen(false);
  const onSwapOpen = async () => {
    const res = await api.post('/api/did/swap', {});
    setSwapOpen(res.data.traceId);
  };
  const onSwapSuccess = () => {
    setTimeout(onSwapClose, 1000);
    let times = 5;
    const timeId = setInterval(() => {
      if (times < 1) {
        clearInterval(timeId);
      }
      times -= 1;
      refresh();
    }, 6000);
  };

  const [authOpen, setAuthOpen] = useState(false);
  const onAuthClose = () => setAuthOpen(false);
  const onAuthSuccess = () => {
    setTimeout(onAuthClose, 1000);
  };

  const onGameStart = (done) => {
    api
      .post('/api/game/start')
      .then(async (data) => {
        await refresh();
        done(null, data);
      })
      .catch((err) => {
        done(err.message);
      });
  };

  const [hasTrophy, setHasTrophy] = useState(false);
  const [trophyOpen, setTrophyOpen] = useState(false);
  const onTrophyClose = () => {
    setTrophyOpen(false);
    setHasTrophy(false);
  };
  const onTrophySuccess = () => {
    setTimeout(onTrophyClose, 1000);
  };
  const onGameOver = (state) => {
    if (state.score > 1024) {
      setHasTrophy(true);
    }
  };

  const webWalletUrl = getWebWalletUrl();

  useEffect(() => {
    refresh(true);
  }, []); // eslint-disable-line

  let prefix = '/';
  if (window.blocklet && window.blocklet.prefix) {
    // eslint-disable-next-line prefer-destructuring
    prefix = window.blocklet.prefix;
  } else if (window.env && window.env.apiPrefix) {
    prefix = window.env.apiPrefix;
  }

  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }

  const onLogout = () => {
    session.logout();
    window.location.href = apiPrefix;
  };

  if (loading) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (!chain || !assetChain) {
    return null;
  }

  return (
    <Layout title="Home">
      <Main>
        <div className="header">
          <h1 className="animated fadeInRightBig">Crypto 2048</h1>
          <Avatar className="user-avatar" variant="circle" src={session.user.avatar} alt={session.user.name} />
        </div>
        <p>
          Use arrow keys to play game.
          <br />
          Press 'N' to start a new game (each start will cost 2 coins)
        </p>
        <div id="main">
          <Game chainInfo={{ chain, assetChain }} onGameStart={onGameStart} onGameOver={onGameOver} />
        </div>
        <div className="buttons">
          <Button size="small" variant="outlined" color="primary" onClick={() => setAuthOpen(true)}>
            Sign Agreement
          </Button>
          {hasTrophy && (
            <Button size="small" variant="outlined" color="primary" onClick={() => setTrophyOpen(true)}>
              Claim Trophy
            </Button>
          )}
          <Button size="small" variant="outlined" color="secondary" onClick={onSwapOpen}>
            Buy Coins
          </Button>
          <Button size="small" color="danger" variant="outlined" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </Main>
      {authOpen && (
        <DidAuth
          responsive
          action="authorize"
          checkFn={api.get}
          onClose={onAuthClose}
          onSuccess={onAuthSuccess}
          checkTimeout={5 * 60 * 1000}
          webWalletUrl={webWalletUrl}
          extraParams={{}}
          messages={{
            title: 'Signature Required',
            scan: 'Scan qrcode to authorize the game to charge you when start new game',
            confirm: 'Review this operation on ABT Wallet',
            success: 'Operation Success',
          }}
        />
      )}
      {trophyOpen && (
        <DidAuth
          responsive
          action="trophy"
          checkFn={api.get}
          onClose={onTrophyClose}
          onSuccess={onTrophySuccess}
          checkTimeout={5 * 60 * 1000}
          webWalletUrl={webWalletUrl}
          extraParams={{}}
          messages={{
            title: 'Claim Trophy',
            scan: 'Scan qrcode to claim your achievement trophy',
            confirm: 'Review this operation on ABT Wallet',
            success: 'Operation Success',
          }}
        />
      )}
      {!!swapOpen && (
        <DidAuth
          responsive
          action="swap"
          checkFn={api.get}
          onClose={onSwapClose}
          onSuccess={onSwapSuccess}
          checkTimeout={5 * 60 * 1000}
          webWalletUrl={webWalletUrl}
          extraParams={{ tid: swapOpen }}
          messages={{
            title: 'Buy Game Coins',
            scan: 'Scan qrcode to buy game coins at rate 1 TBA = 100 Coin',
            confirm: 'Review this operation on ABT Wallet',
            success: 'Operation Success',
          }}
        />
      )}
    </Layout>
  );
}

const Main = styled.main`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h1 {
      font-size: 40px;
      margin: 0;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
    }
  }

  table {
    margin: 0 auto;
  }

  .meta,
  .buttons {
    width: 410px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px auto;
  }

  .cell {
    height: 100px;
    width: 100px;
    background-color: #d0d0d0;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .color-2 {
    background-color: #50c8ff;
  }

  .color-4 {
    background-color: green;
  }

  .color-8 {
    background-color: red;
  }

  .color-16 {
    background-color: orange;
  }

  .color-32 {
    background-color: yellow;
    .number {
      color: #222;
    }
  }

  .color-64 {
    background-color: blue;
  }

  .color-128 {
    background-color: purple;
  }

  .color-256 {
    background-color: pink;
  }

  .color-512 {
    background-color: #50c8ff;
  }

  .color-1024 {
    background-color: green;
  }

  .color-2048 {
    background-color: blue;
  }

  .number {
    color: #fff;
    font-size: 35px;
  }
`;
