import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  ScrollView } from 'react-native-gesture-handler';
import fetchProductData from '../core/fetchProductData.js';


export default function AddProductForm ({ visible, setVisible, products, handleUpdate }) {
    const [ name, setName ] = useState('');
    const [ url, setUrl ] = useState('');
    const [ targetPriceWhole, setTargetPriceWhole ] = useState('');
    const [ targetPriceDecimal, setTargetPriceDecimal ] = useState('');
    const [ notifyLowerPrice, setNotifyLowerPrice ] = useState(true);
    //const [ compareUsedPrice, setCompareUsedPrice ] = useState(false);
    const [ emptyName, setEmptyName ] = useState(false);
    const [ emptyUrl, setEmptyUrl ] = useState(false);
    const [ alreadyListed, setAlreadyListed ] = useState(false);
    const [ zeroTargetPrice, setZeroTargetPrice ] = useState(false);
    const [ alreadyOnTarget, setAlreadyOnTarget] = useState(false);
    const [ fetching, setFetching ] = useState(false);
    const [ fetchError, setFetchError ] = useState(false);

    const fetchData = async () => {
        if (fetching)
            return;

        if (await areInputInvalid())
            return;

        await setFetching(true);
        let prices = await fetchProductData(formatUrl());
        let inputPrice = parseFloat(`${targetPriceWhole}.${targetPriceDecimal}`);
        if (!prices || prices.length == 0) {
            await setFetchError(true);
        } else if (inputPrice == prices[0] || inputPrice > prices[0] ) {
            await setAlreadyOnTarget(true);
            await setFetching(false);
            return;
        } else {
            await setAlreadyOnTarget(false);
            await setFetchError(false);
            await addProductData(prices)
            .catch(error => {
                //TODO
                return;
            });
            await setVisible(false);
            await handleUpdate();
        }
        
        await setTimeout(() => setFetching(false), 5000);
    }


    const addProductData = async (prices) => {
        let productsData = await AsyncStorage.getItem('productsData')
                            .then(item => JSON.parse(item))
                            .then(jsonItem => {
                                if (jsonItem)
                                    return jsonItem;
                                else
                                    return [];
                            });
        let newProductData = await prepareProductData(prices);
        await productsData.unshift(newProductData);
        await AsyncStorage.setItem('productsData', JSON.stringify(productsData));
    }


    const prepareProductData = (prices) => {
        let originalPrice = prices[0];
        //let usedOriginalPrice = prices.length > 1 ? prices[1] : '';
        let priceWholeNumber = targetPriceWhole ? targetPriceWhole : '0';
        let priceDecimalNumber = targetPriceDecimal ? targetPriceDecimal : '0';
        let formattedUrl = formatUrl();

        let productData = {
            name: name,
            site: getProductSite(),
            originalPrice: originalPrice,
            //usedOriginalPrice: usedOriginalPrice,
            targetPrice: parseFloat(`${priceWholeNumber}.${priceDecimalNumber}`),
            currentPrice: originalPrice,
            //currentUsedPrice: usedOriginalPrice,
            lowestPrice: originalPrice,
            //addedDate: `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`,
            addedDate: new Date().getTime(),
            latestUpdate: new Date().getTime(),
            updates: [],
            notifyLowerPrice: notifyLowerPrice,
            //compareUsedPrice: compareUsedPrice,
            url: formattedUrl,
            fetchFails: 0,
            status: 'stable',
            active: true,
            checked: true
        }

        return productData;
    }


    const getProductSite = () => {
        let supportedSites = {
            'gamestop.it': 'GameStop',
            'amazon.': 'Amazon',
            'base.com': 'Base.com'
        }

        let siteKey = Object.keys(supportedSites).filter(site => url.includes(site));
        let site = supportedSites[siteKey];
        return site;
    }


    const areInputInvalid = () => {
        let isInvalid = false;

        if (!name.trim()) {
            setEmptyName(true);
            isInvalid = true;
        } else {
            setEmptyName(false);
        }
        if (!url.trim()) {
            setEmptyUrl(true);
            isInvalid = true;
        } else {
            setEmptyUrl(false);
        }
        let isAlreadyListed = false;
        try {
            let formattedUrl = formatUrl();
            isAlreadyListed = products.some(product => product.url.toLowerCase() == formattedUrl.toLowerCase());
        } catch (error) {
        }
        if (isAlreadyListed) {
            setAlreadyListed(true);
            isInvalid = true;
        } else {
            setAlreadyListed(false);
        }
 
        let targetPrice = parseFloat(`${targetPriceWhole}.${targetPriceDecimal}`);
        if (targetPrice == 0 || isNaN(targetPrice)) {
            setZeroTargetPrice(true);
            isInvalid = true;
        } else {
            setZeroTargetPrice(false);
        }

        return isInvalid;
    }

    const formatUrl = () => {
        let formattedUrl = url;
        
        if (formattedUrl.startsWith('http://')) {
            formattedUrl = formattedUrl.replace('http://', 'https://');
        }
        if (formattedUrl.startsWith('https://') && !formattedUrl.startsWith('https://www.')) {
            formattedUrl = formattedUrl.slice(0, 8) + 'www.' + formattedUrl.slice(8);
        }
        
        return formattedUrl;
    }


    //removes every character that is not a digit from the input
    const handleMoneyInput = (input, type) => {
        if (type == 'whole')
            setTargetPriceWhole(input.replace(/\D/g,''));
        else
            setTargetPriceDecimal(input.replace(/\D/g,''));
    }


    return(
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}>
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={styles.addProductContainer}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.addProductStyle, {width: Dimensions.get('window').width * 0.77}]}>
                            <ScrollView>
                            <Text style={styles.addProductText}>Nome articolo</Text>
                            <TextInput
                                placeholder='Nome che comparirà in watchlist'
                                style={styles.addProductTextInput}
                                value={name}
                                maxLength={80}
                                onChangeText={text => setName(text)}/>
                            {emptyName && <Text style={{left: 8, color: 'red'}}>Il nome non può essere vuoto.</Text>}
                            <Text style={styles.addProductText}>URL</Text>
                            <TextInput
                                placeholder='Es. https://amazon.it/...'
                                style={styles.addProductTextInput}
                                value={url}
                                onChangeText={text => setUrl(text)}/>
                            {emptyUrl && <Text style={{left: 8, color: 'red'}}>L'URL non può essere vuoto.</Text>}
                            {fetchError && <Text style={{left: 8, color: 'red'}}>Recupero informazioni fallito. Sito non supportato o prezzo non disponibile.</Text>}
                            {alreadyListed && <Text style={{left: 8, color: 'red'}}>L'articolo è stato già inserito.</Text>}
                            <Text style={styles.addProductText}>Prezzo target</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 5}}>
                                <Text style={{fontSize: 17}}>€</Text>
                                <TextInput
                                placeholder='00'
                                style={styles.addProductCurrencyInput}
                                value={targetPriceWhole}
                                keyboardType='number-pad'
                                maxLength={12}
                                onChangeText={text => handleMoneyInput(text, 'whole')}/>
                                <Text style={{fontSize: 17}}>,</Text>
                                <TextInput
                                placeholder='00'
                                style={styles.addProductCurrencyInput}
                                value={targetPriceDecimal}
                                keyboardType='number-pad'
                                maxLength={2}
                                onChangeText={text => handleMoneyInput(text, 'decimal')}/>
                            </View>
                            {zeroTargetPrice && <Text style={{left: 8, color: 'red'}}>L'importo non può essere 0.</Text>}
                            {alreadyOnTarget && <Text style={{left: 8, color: 'red'}}>Il prezzo target è già raggiunto o è maggiore del prezzo corrente.</Text>}
                            <View style={styles.optionalChoice}>
                                <View style={{width: '80%'}}>
                                    <Text>Notificami anche se il prezzo cala senza raggiungere il target.</Text>
                                </View>
                                <Switch style={{marginRight: 5}} value={notifyLowerPrice} onValueChange={() => setNotifyLowerPrice(!notifyLowerPrice)}/>
                            </View>
                            {/*<View style={styles.optionalChoice}>
                                <View style={{width: '80%'}}>
                                    <Text>Includi il prezzo dell'usato nella comparazione.</Text>
                                </View>
                                <Switch style={{marginRight: 5}} value={compareUsedPrice} onValueChange={() => setCompareUsedPrice(!compareUsedPrice)}/>
                            </View>*/}
                            <View>
                                {fetching && <Text style={{alignSelf: 'center', color: 'blue'}}>Attendi recupero informazioni...</Text>}
                                <View style={styles.quitAndConfirm}>
                                    <TouchableOpacity onPress={() => setVisible(false)}>
                                        <Text style={styles.quitAndConfirmText}>ANNULLA</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => fetchData()}>
                                        <Text style={styles.quitAndConfirmText}>OK</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}


const styles = StyleSheet.create({
    addProductContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    addProductStyle: {
        backgroundColor: "white",
        borderRadius: 5,
        height: '67%',
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10
    },
    addProductTextInput: {
        borderRadius: 2,
        borderWidth: 0.2,
        borderColor: 'black',
        width: '95%',
        height: 35,
        padding: 5,
        alignSelf: 'center',
    },
    addProductText: {
        left: 8,
        marginTop: 15,
        fontWeight: 'bold'
    },
    optionalChoice: {
        left: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    quitAndConfirm: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    quitAndConfirmText: {
        marginRight: 20,
        fontWeight: 'bold'
    },
    addProductCurrencyInput: {
        borderRadius: 2,
        borderWidth: 0.2,
        borderColor: 'black',
        width: '20%',
        height: 35,
        padding: 5,
        alignSelf: 'center',
        left: 6,
        marginRight: 10
    }
});