const getBtcFiatCashPrice = async (fiatCode, fiatAmount) => {
  try {

    const currency = getCurrency(fiatCode); //ishikawa-23/06/23

    if (!currency.price) return;
	
    // Before hit the endpoint we make sure the code have only 3 chars
    const codeFiat = currency.code.substring(0, 3);

    const response = await axios.get(`${process.env.FIAT_RATE_EP}/${codeFiat}`);
	
	/ SI NO HAY RESPUESTA DE LA OPCION 1, INVOCA LA CONTIGENCIA
    if (response.data.error) {
      if (process.env.IS_ENABLE_COB_GET_BTC_PRICE_FROM_BNB === 'S') {
        const response2 = await getBinanceBtcFiatPrice(fiatCode, fiatAmount, paymentType);
        if (response2 !== undefined) {
          return response2;
        }
      }       
    }

    const bitcoinPrice = Math.floor(response.data.btc);

   if (typeof bitcoinPrice !== 'undefined' && !isNaN(bitcoinPrice) && bitcoinPrice > 0) {
    console.log('Bitcoin Price By https://api.yadio.io:', bitcoinPrice);
    logger.debug(`Bitcoin Price By https://api.yadio.io: ${bitcoinPrice}`);

    let sats = (fiatAmount / bitcoinPrice) * 100000000;
    sats = parseInt(sats);
    
    return {
      fiat_amount: fiatAmount,
      sats_amount: sats,
      fiat_code: codeFiat,   
      bitcoin_price: bitcoinPrice, 
      api_name: 'YADIO',          
    };
  } else {  
  
   // SI NO HAY RESPUESTA DE LA OPCION 1, INVOCA LA CONTIGENCIA
    if (process.env.IS_ENABLE_COB_GET_BTC_PRICE_FROM_BNB === 'S') {
      const response2 = await getBinancePrice(fiatCode, fiatAmount);
      if (response2 !== undefined) {
        return response2;
      }
    }     
  } 
  } catch (error) {
    logger.error(error);
  }
};


OPCION DE BACKP PARA OBTENER PRECIO 

const getBinancePrice = async (fiatCode, fiatAmount) => {
  try {

    const currency = getCurrency(fiatCode);

    if (!currency.price) return;
    // Before hit the endpoint we make sure the code have only 3 chars
    const codeFiat = currency.code.substring(0, 3);
    //const symbol = 'symbol=BTCUSDT';
    const response = await axios.get(`${process.env.FIAT_RATE_BINANCE_EP}`);
    
    if (response.data.error) {
      return {
        fiat_amount: fiatAmount,
        fee_tar: 0,
        new_fiat_amount: fiatAmount,
        sats_amount: 0,
        fiat_code: codeFiat,   
        bitcoin_price: 0,
        api_name: 'BINANCE',           
      };      
    }

    const bitcoinPrice = Math.floor(response.data.price);

    let sats = (fiatAmount / bitcoinPrice) * 100000000;
    sats = parseInt(sats);
    
    return {
      fiat_amount: fiatAmount,
      fee_tar: 0,
      new_fiat_amount: fiatAmount,
      sats_amount: sats,
      fiat_code: codeFiat,   
      bitcoin_price: bitcoinPrice, 
      api_name: 'BINANCE',        
    };    
  } catch (error) {
    logger.error(error);
  }
};
