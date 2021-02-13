import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Alert
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import moment from 'moment';

export default function SettingsScreen() {
    const [ notifications, setNotifications ] = useState([]);
    const [ update, setUpdate ] = useState(false);
    const notifics = 'notifications';


    const getDate = (timestamp) => {
        return moment(timestamp).format("DD/MM/YYYY HH:mm");
    }

    const getIcon = (type) => {
        let icons = {
            'target': '⭐',
            'drop': '📉',
            'fail': '⚠️'
        }

        return icons[type];
    }

    const deleteNotifications = () => {
        Alert.alert(
            "Elimina notifiche",
            "Vuoi eliminare tutte le notifiche?",
            [
              {
                text: "Annulla",
                onPress: () => { return; },
                style: "cancel"
              },
              {
                text: "OK",
                onPress: () => {
                    AsyncStorage.setItem(notifics, JSON.stringify([]))
                    .then(() => setUpdate(!update))
                    .catch(error => {});
                }
              }
            ],
            { cancelable: false }
          );
    }

    useEffect(() => {
        AsyncStorage.getItem(notifics)
        .then(data => JSON.parse(data))
        .then(jsonData => {
            if(jsonData)
                setNotifications(jsonData);
        })
        .catch(error => {});
    }, [update]);

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Notifiche</Text>
                {notifications.length > 0 && <View>
                    <TouchableNativeFeedback onPress={() => deleteNotifications()}
                        background={TouchableNativeFeedback.Ripple('default', true)}>
                            <Icon name={'delete'} size={27} color={'black'} />
                    </TouchableNativeFeedback>
                </View>}
            </View>
            <FlatList data={notifications}
                keyExtractor={item => item.date.toString()}
                renderItem={({ item }) => (
                    <TouchableNativeFeedback onPress={() => {}}>
                        <View style={styles.itemContainer}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', marginTop: 10}}>
                                    <Text>{getIcon(item.type)}</Text>
                                    <Text style={styles.productName}>{item.product.name}</Text>
                                </View>
                                <Text style={styles.date}>{getDate(item.date)}</Text>
                            </View>
                            <Text>{item.message}</Text>
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
        alignItems: 'center',
        paddingRight: 15
    },
    screenTitle: {
        fontWeight: 'bold',
        fontSize: 20
    },
    itemContainer: {
        padding: 7,
        backgroundColor: '#F8F8F8F8',
        borderBottomWidth: 0.2,
        borderColor: 'grey'
    },
    date: {
        fontSize: 13
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 15,
    }
});