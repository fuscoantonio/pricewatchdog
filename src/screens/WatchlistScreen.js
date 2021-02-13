import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import AddProductForm from '../components/AddProductForm';
import Product from '../components/Product';


export default function WatchlistScreen({ navigation }) {
    const [ productsData, setProductsData ] = useState([]);
    const [ addProductVisible, setAddProductVisible ] = useState(false);
    const [ update, setUpdate ] = useState(true);
    
    const handleUpdate = () => {
        setUpdate(!update);
    }

    useEffect(() => {
        AsyncStorage.getItem('productsData')
        .then(data => JSON.parse(data))
        .then(jsonData => {
            if(jsonData)
                setProductsData(jsonData);
        })
        .catch(error => {});
    }, [update]);


    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Watchlist</Text>
            </View>
            {addProductVisible &&
            <AddProductForm visible={addProductVisible}
                setVisible={setAddProductVisible}
                products={productsData}
                handleUpdate={handleUpdate}/>}
            <FlatList data={productsData}
                keyExtractor={item => item.url}
                renderItem={({ item, index }) => (
                    <TouchableNativeFeedback onLongPress={() => navigation.push('WatchlistDeleteScreen', {
                        products: productsData,
                        update: handleUpdate,
                        index: index})}
                        onPress={() => navigation.push('ProductScreen', {products: productsData, index: index, update: handleUpdate})}>
                        <Product item={item}/>
                    </TouchableNativeFeedback>
                )}/>
            <View style={styles.addProductButton}>
                <TouchableNativeFeedback onPress={() => setAddProductVisible(true)}
                background={TouchableNativeFeedback.Ripple('default', true)}>
                    <Icon name={'add'} size={42} color={'white'} />
                </TouchableNativeFeedback>
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
    screenTitle: {
        fontWeight: 'bold',
        fontSize: 20
    },
    addProductButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        backgroundColor: 'lightblue',
        borderRadius: 50,
        alignSelf: 'center',
        bottom: 15,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center'
    }
});