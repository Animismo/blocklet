/* eslint-disable import/prefer-default-export */
export function getWebWalletUrl() {
  return window.localStorage.getItem('wallet_url') || 'https://web.abtwallet.io/';
}
