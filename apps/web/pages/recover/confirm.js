import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToast, Text, Link } from '@chakra-ui/react';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  RecoverAccount,
} from '../../src/components';
import { useRecoverStore, recoverRecoverConfirmPageSelector } from '../../src/state';
import { useRecoverAccountChannel } from '../../src/hooks';
import { App, Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';
import { txStatus } from '../../src/utils/transaction';

function RecoverConfirm() {
  const router = useRouter();
  const toast = useToast();
  const {
    loading: recoverLoading,
    userOperations,
    confirm,
    onComplete,
    channelId,
  } = useRecoverStore(recoverRecoverConfirmPageSelector);

  useRecoverAccountChannel(channelId, (data) => {
    toast({
      title:
        data.status === txStatus.success ? 'Account recovery success' : 'Account recovery fail',
      description:
        data.status === txStatus.success ? (
          'Redirecting to login in 5 seconds.'
        ) : (
          <Text>
            Recovery failed. See transaction details{' '}
            <Link
              fontWeight="bold"
              href={`${App.web3.explorer}/tx/${data.transactionHash}`}
              isExternal
            >
              here
            </Link>
            .
          </Text>
        ),
      status: data.status === txStatus.success ? 'success' : 'error',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
      onCloseComplete:
        data.status === txStatus.success ? () => router.push(Routes.LOGIN) : undefined,
    });
    data.status === txStatus.success && logEvent(EVENTS.RECOVER_ACCOUNT_CONFIRM_SUCCESS);
    onComplete();
  });

  useEffect(() => {
    router.prefetch(Routes.LOGIN);
  }, [router]);

  useEffect(() => {
    if (!userOperations) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperations]);

  const onConfirmTrasaction = async (data) => {
    await confirm(data.password);
    logEvent(EVENTS.RECOVER_ACCOUNT_CONFIRM);
    toast({
      title: 'Recovery initiated',
      description: 'This might take a minute. Stay on this page for updates...',
      status: 'info',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Submit recovery" backLinkUrl={Routes.RECOVER_LOOKUP} />

        <AppContainer>
          <RecoverAccount isLoading={recoverLoading} onConfirmTrasaction={onConfirmTrasaction} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverConfirm;
