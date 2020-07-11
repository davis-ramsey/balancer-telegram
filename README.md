# Telegram bot for tracking Balancer Pools

### Overview
Simple telegram bot that uses a user's wallet address to scan for any shares in balancer pools. It will display the user's total market value and fees earned over the last 24 hrs across all balancer pools that the user has shares in.

Note: Requires NodeJS, axios, and node-telegram-bot-api to function.


### How to setup:
1. Set up your own bot with BotFather - https://telegram.me/BotFather
2. Create a keys.js that exports your bot token, or just set const token = 'your_bot_token' globally in index.js
3. run index.js in node (or host in a 3rd party service)
4. in a message to your bot, enter your ethereum wallet address that holds your BPT (balancer pool tokens).

example: 0xa524A07906cf5c3B7F90265CaB553388016cA385

this would start tracking all balancer pool holdings for wallet address 0xa524A07906cf5c3B7F90265CaB553388016cA385.

Note: The initial settings are to display total market value and fees earned every 5 minutes. That can be changed in index.js on line 79. 
