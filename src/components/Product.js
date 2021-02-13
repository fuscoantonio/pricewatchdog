import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
export default function Product ({ item, selected }) {
    const statusTypes = {
        stable: {
            icon: 'horizontal-rule',
            color: 'grey'
        },
        rising: {
            icon: 'expand-less',
            color: 'red'
        },
        dropping: {
            icon: 'expand-more',
            color: 'green'
        },
        target: {
            icon: 'star',
            color: 'gold'
        },
        error: {
            icon: 'error',
            color: 'black'
        },
    };

    return (
        <View style={[styles.productContainer, {backgroundColor: selected ? '#DDDDDD' : '#F8F8F8'}]}>
            <View style={styles.productTitleContainer}>
                <Text style={styles.productTitle}>{item.name && item.name}</Text>
                <Icon name={statusTypes[item.status].icon} size={30} color={statusTypes[item.status].color} />
            </View>
            <View style={styles.productDetailsContainer}>
                <View style={styles.productDetails}>
                    <Text style={styles.productDetailsTitle}>Prezzo attuale</Text>
                    <Text>€{item.currentPrice && item.currentPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.productDetails}>
                    <Text style={styles.productDetailsTitle}>Prezzo più basso</Text>
                    <Text>€{item.lowestPrice && item.lowestPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.productDetails}>
                    <Text style={styles.productDetailsTitle}>Prezzo target</Text>
                    <Text>€{item.targetPrice && item.targetPrice.toFixed(2)}</Text>
                </View>
            </View>
        </View>);
}

const styles = StyleSheet.create({
    productContainer: {
        padding: 10,
        backgroundColor: '#F8F8F8F8'
    },
    productTitleContainer: {
        borderBottomColor: 'grey',
        borderBottomWidth: 0.2,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    productTitle: {
        fontWeight: 'bold',
        fontSize: 19,
        width: '90%'
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
    }
});