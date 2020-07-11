const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = require('./keys');

const bot = new TelegramBot(token, { polling: true });

const coingeckoAPI = axios.create({ baseURL: 'https://api.coingecko.com/api/v3/simple/token_price' });

bot.on('message', (msg) => {
	chatId = msg.chat.id;
	const userAddress = msg.text.toLowerCase();
	bot.sendMessage(chatId, `Scanning Balancer pools for wallet address ${userAddress}`);
	setInterval(() => {
		axios({
			url: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer',
			method: 'post',
			data: {
				query: `{
        poolShares (where: {userAddress: "${userAddress}"}) {
        userAddress {
         id
       }
       balance
   poolId {
       id
      swapFee
      totalShares
      totalSwapVolume
      tokensList
     tokens {
        address
        balance
        decimals
      }
         swaps (first: 1,orderBy: timestamp,orderDirection: desc, where: {timestamp_lt: ${Math.floor(
				Date.now() / 1000
			) - 86400}}) {
           tokenIn
           tokenInSym
           tokenAmountIn
           tokenOut
           tokenOutSym
           tokenAmountOut
           poolTotalSwapVolume
         }
       }
      }
     }`
			}
		}).then(({ data }) => {
			const poolList = data.data.poolShares.filter((pool) => parseFloat(pool.balance) !== 0);
			let totalValue = 0;
			let dayFees = 0;
			poolList.map(async (pool) => {
				const tokenList = [];
				const tokenBalances = [];
				let poolTotal = 0;
				for (let token of pool.poolId.tokens) {
					tokenList.push(token.address);
					tokenBalances.push(token.balance);
				}
				const prices = await coingeckoAPI.get(
					`/ethereum?contract_addresses=${tokenList.join(',')}&vs_currencies=usd`
				);
				for (let i = 0; i < tokenList.length; i++) {
					poolTotal += tokenBalances[i] * prices.data[tokenList[i]].usd;
				}
				totalValue += poolTotal * (pool.balance / pool.poolId.totalShares);
				dayFees +=
					(pool.poolId.totalSwapVolume - pool.poolId.swaps[0].poolTotalSwapVolume) *
					pool.poolId.swapFee *
					(pool.balance / pool.poolId.totalShares);
			});
			setTimeout(() => {
				bot.sendMessage(chatId, `Current Portfolio Value: $${Number(totalValue.toFixed(2)).toLocaleString()}`);
				bot.sendMessage(chatId, `Fees Earned for last 24 hrs: $${Number(dayFees.toFixed(2)).toLocaleString()}`);
			}, 2000);
		});
	}, 300000);
});
