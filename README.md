# Base-Business
The following describes how to run Base-Business locally
1. git clone
2. "envVariables" branch
3. npm i
4. npm run postinstall
5. I don't use watching mode
so use "tsc" for build TS  int JS into ./bin folder
6. I recommend VSCode use menu for launch app for debug
- as example to connect to local base-node: NODE_HOST=http://localhost:8080/ && NODE_ENV=production && npm start

#  Scenario
The following describes how to verify base-business is working
1. Create a new Business in BASE
- you have to make a new BASE user (Business) and set its phrase to environment variable  (e.g. BUSINESS_PHRASE=rookie wonder mistake nothing whip theme feed card disease identify cushion nephew)
2. Create offer with price (e.g 1 CAT). Add some fields which will be shared with business 
- the field *“eth_wallets”* is required
3. Add record eth_wallets to customer (if you have not done it yet), and add sharable fields
- you can do this by using the engineering Example App
4. Login as the customer and create a Search request using the Example App
5. Match the search request (from customer) and offer (from business) using the Example App
6. Open (customer account) search request and grant access usign the Example App
7. Reward (e.g 1 CAT ) will be paid from business to customer
- you might need to wait for the transaction to be mined
- you can check the status of the transaction by checking ETH address of the Business or the Customer


