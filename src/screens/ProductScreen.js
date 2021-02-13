import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Linking,
  Switch
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import moment from 'moment';


export default function WatchlistScreen({ navigation, route }) {
    const productsData = route.params.products;
    const product = productsData[route.params.index];
    const index = route.params.index;
    const [ notify, setNotify ] = useState(product.notifyLowerPrice);

    const deleteProduct = () => {
        Alert.alert(
            "Cancellazione articolo",
            "Vuoi eliminare l'articolo?",
            [
              {
                text: "Annulla",
                onPress: () => { return; },
                style: "cancel"
              },
              {
                text: "OK",
                onPress: () => {
                    let newData = [...productsData];
                    newData.splice(index, 1);
                    AsyncStorage.setItem('productsData', JSON.stringify(newData)).then(() => {
                        let update = route.params.update;
                        update();
                        navigation.pop();
                    })
                    .catch(error => {});
                }
              }
            ],
            { cancelable: false }
          );
    }

    const openLink = () => {
        Linking.canOpenURL(product.url).then(canOpen => {
            if (canOpen)
                Linking.openURL(product.url);
        });
    }

    const getDate = (timestamp) => {
        return moment(timestamp).format("DD/MM/YY HH:mm");
    }


    const handleGoBack = () => {
        if (notify !== product.notifyLowerPrice) {
            let newData = [...productsData];
            newData[index].notifyLowerPrice = notify;
            AsyncStorage.setItem('productsData', JSON.stringify(newData));
        }
        navigation.pop();
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <View style={styles.headerIconsContainer}>
                    <TouchableNativeFeedback onPress={() => { handleGoBack() }}
                    background={TouchableNativeFeedback.Ripple('default', true)}>
                        <Icon name={'arrow-back'} size={27} color={'black'} />
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.headerIconsContainer}>
                    <View style={styles.icons}>
                        <TouchableNativeFeedback onPress={() => openLink() }
                        background={TouchableNativeFeedback.Ripple('default', true)}>
                            <Icon name={'open-in-new'} size={27} color={'black'} />
                        </TouchableNativeFeedback>
                    </View>
                    <View style={styles.icons}>
                        <TouchableNativeFeedback onPress={() => deleteProduct() }
                        background={TouchableNativeFeedback.Ripple('default', true)}>
                            <Icon name={'delete'} size={27} color={'black'} />
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>
            <View style={styles.mainContainer}>
                <View style={styles.nameView}>
                    <Text style={styles.name}>{product.name}</Text>
                </View>
                <View style={styles.section}>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Prezzo attuale:</Text>
                        <Text style={styles.property}>€{product.currentPrice}</Text>
                    </View>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Prezzo più basso:</Text>
                        <Text style={styles.property}>€{product.lowestPrice}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Prezzo target:</Text>
                        <Text style={styles.property}>€{product.targetPrice}</Text>
                    </View>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Prezzo originale:</Text>
                        <Text style={styles.property}>€{product.originalPrice}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Data {'\n'}inserimento:</Text>
                        <Text style={styles.property}>{getDate(product.addedDate)}</Text>
                    </View>
                    <View style={styles.propertyView}>
                        <Text style={styles.propertyName}>Ultimo update:</Text>
                        <Text style={styles.property}>{getDate(product.latestUpdate)}</Text>
                    </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                    <Text style={{width: '85%', fontSize: 15}}>Notificami anche se il prezzo cala senza raggiungere il target.</Text>
                    <Switch value={notify} onValueChange={() => setNotify(!notify)}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
        height: 58,
        elevation: 4,
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 25,
        width: '70%',
        flexWrap: 'wrap'
    },
    headerIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icons: {
        marginLeft: 25
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8F8F8F8',
        padding: 5,
        paddingRight: 25,
        paddingLeft: 25
    },
    name: {
        fontSize: 23,
        fontWeight: 'bold',
        flexWrap: 'wrap',
        textAlign: 'center',
        alignSelf: 'center',
        marginBottom: 10
    },
    nameView: {
        width: '100%',
        borderBottomWidth: 0.2
    },
    propertyName: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    property: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10
    },
    propertyView: {
        borderBottomWidth: 0.2
    },
    section: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});