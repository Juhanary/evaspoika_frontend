import { useLocalSearchParams } from 'expo-router';
import LogScreen from '@/src/features/logs/presentation/screens/LogScreen';

export default function MoreLogsRoute() {
  const { customerId } = useLocalSearchParams();
  const parsedCustomerId = customerId ? Number(customerId) : undefined;
  
  return <LogScreen leftAction="back" customerId={parsedCustomerId} />;
}
