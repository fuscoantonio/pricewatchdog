import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Linking
} from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

export default function SettingsScreen() {
    const appInfo = [
        { title: 'Siti supportati', text: 'Amazon, GameStop, Base.com', url: '', key:  '1'},
        { title: 'Versione', text: '0.1-alpha', url: '', key: '2'},
        { title: 'GitHub', text: 'https://github.com/fuscoantonio/pricewatchdog', url: 'https://github.com/fuscoantonio/pricewatchdog', key: '3'}
    ]

    const openUrl = (url) => {
        if (url) {
            Linking.openURL(url);
        }
    }

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>About</Text>
            </View>
            <FlatList data={appInfo}
                renderItem={({ item }) => (
                    <TouchableNativeFeedback onPress={() => openUrl(item.url)}>
                        <View style={styles.itemContainer}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text>{item.text}</Text>
                        </View>
                    </TouchableNativeFeedback>
                )}/>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
        height: 58,
        elevation: 4,
        justifyContent: 'space-between',
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    screenTitle: {
        fontWeight: 'bold',
        fontSize: 20
    },
    itemContainer: {
        padding: 20,
        backgroundColor: '#F8F8F8F8'
    },
    itemTitle: {
        fontWeight: 'bold',
        fontSize: 15
    }
});