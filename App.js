import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar
} from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Icon from '@expo/vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//Screens import
import WatchlistScreen from './src/screens/WatchlistScreen';
import WatchlistDeleteScreen from './src/screens/WatchlistDeleteScreen';
import ProductScreen from './src/screens/ProductScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
//Tasks
import checkPricesTask from './src/core/checkPricesTask';

//Stacks initialization
const WatchlistStack = createStackNavigator();
const HistoryStack = createStackNavigator();
const SettingsStack = createStackNavigator();
//BottomTab
const BottomTab = createBottomTabNavigator();

//Stacks
const WatchlistStackScreen = () => (
  <WatchlistStack.Navigator headerMode='none'>
    <WatchlistStack.Screen name="Watchlist" component={WatchlistScreen}/>
    <WatchlistStack.Screen name="WatchlistDeleteScreen" component={WatchlistDeleteScreen} options={{
        animationEnabled: false,
      }}/>
    <WatchlistStack.Screen name="ProductScreen" component={ProductScreen}/>
  </WatchlistStack.Navigator>
);

const checkPrices = 'checkPrices';

TaskManager.defineTask(checkPrices, () => {
  checkPricesTask()
  .then(data => BackgroundFetch.Result.NewData)
  .catch(error => BackgroundFetch.Result.Failed);
});


export default function App() {
  const [pushToken, setPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    BackgroundFetch.registerTaskAsync(checkPrices, {
      minimumInterval: 930, //15.5 minutes
      stopOnTerminate: false,
      startOnBoot: true
    });
    
    registerForPushNotificationsAsync().then(token => setPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <NavigationContainer>
        <StatusBar barStyle='dark-content' backgroundColor='white' />
        <BottomTab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Watchlist') {
            iconName = 'remove-red-eye';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Settings') {
            iconName = 'keyboard-control';
          }

          return <Icon name={iconName} size={size} color={color} />;

        },
        })}>
          <BottomTab.Screen name="Watchlist" component={WatchlistStackScreen} options={{title: "Watchlist"}} />
          <BottomTab.Screen name="Notifications" component={NotificationsScreen} options={{title: "Notifiche"}} />
          <BottomTab.Screen name="Settings" component={SettingsScreen} options={{title: "About"}} />
        </BottomTab.Navigator>
      </NavigationContainer>
  );
}


async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Non potrai ricevere notifiche sui prezzi degli articoli inseriti.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }/* else {
    alert('Must use physical device for Push Notifications');
  }*/

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}