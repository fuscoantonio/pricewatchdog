import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Alert
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import Product from '../components/Product';


export default function WatchlistDeleteScreen({ navigation, route }) {
    const [ productsData ] = useState(route.params.products);
    const [ selectedProducts, setSelectedProducts ] = useState([]);
    const [ selectCount, setSelectCount ] = useState(0);

    const selectAll = () => {
        setSelectedProducts(
            productsData.map(() => true)
        );
    }


    const initialSelect = () => {
        setSelectedProducts(
            productsData.map((value, i) => i === route.params.index ? true : false)
        );
    }


    const toggleSelected = (index) => {
        const selectedProductsNew =
            selectedProducts.map(
                (value, i) => i === index ? !value : value
        );
        setSelectedProducts(selectedProductsNew);
    }


    const deleteSelected = () => {
        Alert.alert(
            "Cancellazione articoli",
            "Vuoi eliminare gli articoli selezionati?",
            [
              {
                text: "Annulla",
                onPress: () => { return; },
                style: "cancel"
              },
              {
                text: "OK",
                onPress: () => {
                    let newData = [];
                    for (let i = 0; i < productsData.length; i++) {
                        if (!selectedProducts[i])
                            newData.push(productsData[i]);
                    }

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

    useEffect(() => {
        let count = 0;
        selectedProducts.map(value => value === true ? count++ : 0);
        setSelectCount(count);
    }, [selectedProducts]);


    useEffect(() => {
        initialSelect();
    }, []);


    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <View style={styles.headerIconsContainer}>
                    <TouchableNativeFeedback onPress={() => navigation.pop()}
                    background={TouchableNativeFeedback.Ripple('default', true)}>
                        <Icon name={'close'} size={27} color={'black'} />
                    </TouchableNativeFeedback>
                    <Text style={{fontWeight: 'bold', fontSize: 20, marginLeft: 25}}>{selectCount}</Text>
                </View>
                <View style={styles.headerIconsContainer}>
                    <View style={styles.icons}>
                        <TouchableNativeFeedback onPress={() => { selectAll() }}
                        background={TouchableNativeFeedback.Ripple('default', true)}>
                            <Icon name={'select-all'} size={27} color={'black'} />
                        </TouchableNativeFeedback>
                    </View>
                    {selectCount > 0 &&
                    <View style={styles.icons}>
                        <TouchableNativeFeedback onPress={() => { deleteSelected() }}
                        background={TouchableNativeFeedback.Ripple('default', true)}>
                                <Icon name={'check'} size={27} color={'black'} />
                        </TouchableNativeFeedback>
                    </View>}
                </View>
            </View>
            <FlatList data={productsData}
                keyExtractor={item => item.url}
                renderItem={({ item, index }) => (
                    <TouchableHighlight onPress={() => toggleSelected(index)}>
                        <Product item={item}
                            selected={selectedProducts[index]}/>
                    </TouchableHighlight>
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
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    screenTitle: {
        fontWeight: 'bold',
        fontSize: 20
    },
    productContainer: {
        padding: 10
    },
    productTitle: {
        fontWeight: 'bold',
        fontSize: 19,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.2
    },
    productDetailsTitle: {
        fontWeight: 'bold',
        fontSize: 14
    },
    productDetailsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
        justifyContent: 'space-between'
    },
    productDetails: {
        flexWrap: 'wrap'
    },
    icons: {
        marginLeft: 25
    }
});