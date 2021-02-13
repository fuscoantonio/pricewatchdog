import axios from 'axios';
const cheerio = require('react-native-cheerio');
const requestOptions = {
    headers: {
        'Accept': 'text/html',
        'Accept-Language': 'it-IT,it;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36'
    },
    timeout: 4000
};

export default fetchProductData = async (url) => {
    
    return await axios.get(url, requestOptions)
    .then(response => response.data)
    .then(data => {
        let $ = cheerio.load(data);
        let prices = [];
        if (url.startsWith('https://www.amazon.') || url.startsWith('https://amazon.')) {
            prices = extractPrices($, ['#priceblock_ourprice', '.a-color-price']);
        } else if (url.startsWith('https://www.base.com') || url.startsWith('https://base.com')) {
            prices = extractPrices($, ['.price-info .price']);
        } else if (url.startsWith('https://www.gamestop.it') || url.startsWith('https://gamestop.it')) {
            prices = extractPrices($, ['.prodPriceCont.valuteCont.pricetext', '.prodPriceCont.valuteCont.pricetext1', '.prodPriceCont.valuteCont']);
        } else {
            prices = [formatPrice(data.toString())];
        }
        
        return prices;
    })
    .catch(error => {
        return undefined;
    });

    // ---- FOR TESTING ----
    // return await axios.get(url, { timeout: 4000 })
    // .then(response => response.data)
    // .then(data => {
    //     let prices = [formatPrice(data.toString())];
    //     return prices;
    // })
    // .catch(error => {
    //     console.log(error);
    //     return undefined;
    // });
}


const extractPrices = ($, selectors) => {
    let prices = [];
    let price;

    for (let selector of selectors) {
        price = tryGetPrice($, selector);
        if (price) {
            prices.push(price);
            break;
        }
    }
    return prices;
}


const tryGetPrice = ($, selector) => {
    let price;
    try {
        price = $(selector)[0].children[0].data;
        price = formatPrice(price);
    } catch (error) {
        price = undefined;
    }
    return price;
}


const formatPrice = (price) => {
    price = price.replace(/[€$£]/g, '').trim();
    price = price.replace(',', '.');
    try {
        price = parseFloat(price);
    } catch (error) {
        price = undefined;
    }
    return price;
}