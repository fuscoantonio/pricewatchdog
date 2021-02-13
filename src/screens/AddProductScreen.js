import React, { useEffect, useState } from 'react';
import {
  TextInput,
  View,
  Text
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

export default function AddProductScreen({ navigation, route }) {

    return(
        <View style={{flex: 1}}>
            <TextInput value={'boh'} onChangeText={value => {}}></TextInput>
        </View>
    );
}