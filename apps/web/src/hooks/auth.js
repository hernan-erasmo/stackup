import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isExpired } from 'react-jwt';
import {
  useAccountStore,
  accountUseAuthSelector,
  useSearchStore,
  searchUseAuthSelector,
  useActivityStore,
  activityUseAuthSelector,
  useWalletStore,
  walletUseAuthSelector,
  useOnboardStore,
  onboardUseAuthSelector,
  useRecoverStore,
  recoverUseAuthSelector,
  useNotificationStore,
  notificationUseAuthSelector,
  useUpdateStore,
  updateUseAuthSelector,
  useHistoryStore,
  historyUseAuthSelector,
  useAppsStore,
  appsUseAuthSelector,
  usePusherStore,
  pusherUseAuthSelector,
} from '../state';
import { Routes } from '../config';

const REFRESH_INTERVAL_MS = 300000; // 5 minutes
const initAuthRoutes = new Set([
  Routes.LOGIN,
  Routes.SIGN_UP,
  Routes.RECOVER_LOOKUP,
  Routes.RECOVER_NEW_PASSWORD,
  Routes.RECOVER_NOT_POSSIBLE,
  Routes.RECOVER_VERIFY_EMAIL,
  Routes.RECOVER_STATUS,
  Routes.RECOVER_CONFIRM,
]);

export const useLogout = () => {
  const { logout } = useAccountStore(accountUseAuthSelector);
  const { clear: clearSearch } = useSearchStore(searchUseAuthSelector);
  const { clear: clearActivity } = useActivityStore(activityUseAuthSelector);
  const { clear: clearWallet } = useWalletStore(walletUseAuthSelector);
  const { clear: clearOnboard } = useOnboardStore(onboardUseAuthSelector);
  const { clear: clearRecover } = useRecoverStore(recoverUseAuthSelector);
  const { clear: clearNotification } = useNotificationStore(notificationUseAuthSelector);
  const { clear: clearUpdate } = useUpdateStore(updateUseAuthSelector);
  const { clear: clearHistory } = useHistoryStore(historyUseAuthSelector);
  const { clear: clearApps } = useAppsStore(appsUseAuthSelector);
  const { clear: clearPusher } = usePusherStore(pusherUseAuthSelector);

  return async () => {
    clearSearch();
    clearActivity();
    clearWallet();
    clearOnboard();
    clearRecover();
    clearNotification();
    clearUpdate();
    clearHistory();
    clearApps();
    clearPusher();
    await logout();
  };
};

export const useAuth = () => {
  const router = useRouter();
  const { wallet, accessToken, refreshToken, refresh, enableAccount } =
    useAccountStore(accountUseAuthSelector);
  const { initAppSessions } = useAppsStore(appsUseAuthSelector);
  const logout = useLogout();
  const [isFirst, setIsFirst] = useState(true);

  const isLoggedOut = () => !refreshToken;
  const refreshTokenExpired = () => isExpired(refreshToken?.token);
  const accessTokenExpired = () => isExpired(accessToken?.token);
  const notOnAuthPage = () => !initAuthRoutes.has(location.pathname);
  const onLoginPage = () => location.pathname === Routes.LOGIN;
  const shouldRefresh = () => accessToken && refreshToken && !isExpired(refreshToken.token);

  useEffect(() => {
    const authCheck = async () => {
      try {
        if (isLoggedOut()) {
          notOnAuthPage() && router.push(Routes.LOGIN);
        } else if (refreshTokenExpired()) {
          await logout();
          notOnAuthPage() && router.push(Routes.LOGIN);
        } else if (isFirst) {
          setIsFirst(false);
          await refresh();
        } else {
          accessTokenExpired() && (await refresh());
          onLoginPage() && router.push(Routes.HOME);
        }
      } catch (error) {
        console.error(error);
        await logout().catch(console.error);
      }
    };

    authCheck()
      .then(enableAccount)
      .then(() => {
        if (wallet) initAppSessions(wallet.walletAddress);
      });
  }, [refreshToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldRefresh()) {
        refresh();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);
};
