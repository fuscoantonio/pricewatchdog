import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchProductData from './fetchProductData';
import * as Notifications from 'expo-notifications';

const productsData = 'productsData';
const notifics = 'notifications';
var notifications = [];
const MAX_PROCESS_TIME = 29500; //29.5 seconds in milliseconds

export default checkPricesTask = async () => {
    let isDeviceConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (!isDeviceConnected)
        return;

    let startTime = await new Date().getTime();
    
    let products = await AsyncStorage.getItem(productsData)
                    .then(data => JSON.parse(data))
                    .catch(() => {});
    
    notifications = await AsyncStorage.getItem(notifics)
                    .then(data => {
                        if (data)
                            return JSON.parse(data);
                        else
                            return [];
                    })
                    .catch(() => {
                        return [];
                    });
    
    if (!products)
        return;
    
    do {
        let startIndex = await getStartIndex(products);
        
        for (let i = startIndex; i < products.length; i++) {
            let timeDifference = await new Date().getTime() - startTime;
            if (timeDifference >= MAX_PROCESS_TIME)
                break;

            let alreadyUpdated = await products[i].latestUpdate >= startTime;
            if (!products[i].active || alreadyUpdated)
                continue;
            
            let newPrices = await fetchProductData(products[i].url);
            await updateProduct(products[i], newPrices);
            await AsyncStorage.setItem(productsData, JSON.stringify(products))
            .catch(() => {});
        }
    } while (timeDifference < MAX_PROCESS_TIME); //continues looping as long as it's within 29.5 seconds
}


const getStartIndex = (products) => {
    let startIndex;
    for (let i = 0; i < products.length; i++) {
        if (!products[i].checked && products[i].active) {
            startIndex = i;
            break;
        }
    }
    
    if (!startIndex) {
        //resetting all products as not checked
        products.map(product => product.checked = false);
        startIndex = 0;
    }
    
    return startIndex;
}


const updateProduct = (product, newPrices) => {
    let hasFailed = checkForFail(product, newPrices);
    setStatus(product, newPrices);
    product.latestUpdate = new Date().getTime();
    product.checked = true;
    if (hasFailed)
        return;
    
    setPrices(product, newPrices);
}


const setPrices = (product, newPrices) => {
    if (newPrices[0] <= product.targetPrice) {
        product.currentPrice = newPrices[0];
        product.lowestPrice = newPrices[0];
        let title = `⭐Prezzo target raggiunto!⭐`;
        let body = `${product.name} ha raggiunto il prezzo di €${product.targetPrice.toFixed(2)}, ora è a €${product.currentPrice.toFixed(2)}`;
        notifyUser(title, body);
        let message = `${product.name} ha raggiunto il prezzo di €${product.targetPrice.toFixed(2)}`;
        addNotification(product, 'target', message);
        product.active = false;
    } else if (newPrices[0] < product.lowestPrice) {
        product.lowestPrice = newPrices[0];
        if (product.notifyLowerPrice) {
            let title = `📉Calo di prezzo!📉`;
            let difference = product.currentPrice - newPrices[0];
            product.currentPrice = newPrices[0];
            let body = `Prezzo di ${product.name} sceso di €${difference.toFixed(2)}, ora è a €${product.currentPrice.toFixed(2)}`;
            notifyUser(title, body);
            let message = `Prezzo di ${product.name} sceso di €${difference.toFixed(2)}`;
            addNotification(product, 'drop', message);
        }
    }
    product.currentPrice = newPrices[0];
}


const notifyUser = (title, body) => {
    Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: {
              data: 'goes here'
            },
        },
        trigger: {
            seconds: 1
        },
    });
}



const checkForFail = (product, newPrices) => {
    let hasFailed = false;
    if (!newPrices || newPrices.length == 0) {
        product.fetchFails++;
        if (product.fetchFails == 3) {
            product.active = false;
            let title = `⚠️Aggiornamento prezzo fallito⚠️`;
            let body = `Recupero prezzo per ${product.name} fallito troppe volte. Assicurati che l'articolo esista ancora.`;
            notifyUser(title, body);
            let message = `Recupero prezzo per ${product.name} fallito troppe volte.`
            addNotification(product, 'fail', message);
        }
        hasFailed = true;
    } else {
        product.fetchFails = 0;
    }

    return hasFailed;
}


const setStatus = (product, newPrices) => {
    if (product.fetchFails == 3) {
        product.status = 'error';
    } else if (!newPrices) {
        return;
    } else if (newPrices[0] <= product.targetPrice) {
        product.status = 'target';
    } else if (newPrices[0] < product.currentPrice) {
        product.status = 'dropping';
    } else if (newPrices[0] > product.currentPrice) {
        product.status = 'rising';
    } else if (newPrices[0] == product.currentPrice) {
        product.status = 'stable';
    }
}

const addNotification = (product, type, message) => {
    newNotification = {
        product: product,
        type: type,
        date: new Date().getTime(),
        message: message
    }

    notifications.unshift(newNotification);
    if (notifications.length > 50)
        notifications.pop();
    AsyncStorage.setItem(notifics, JSON.stringify(notifications)).catch(error => {});
}
