import { router } from 'expo-router';
import { routes } from '@/src/shared/navigation/routes';

export function goBackOrHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.navigate(routes.home);
}
