import { View, Text } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { router } from 'expo-router';

export default function ModalScreen() {
    return (
        <View style={[layout.screen, layout.center]}>
            <Text>This is a Modal Screen</Text>
            <CustomButton label="Close Modal" onPress={() => {router.back(); }} />
        </View>
    );
}
    