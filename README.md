# Base-Business
pls set up proper env variables for your run environment
e.g.:
```
  "NODE_HOST":"https://base2-bitclva-com.herokuapp.com",
  "ETH_PK": "02147069a6df43ebb363942211e924a178c1f03cb6383bd6d61e8d76e0b9126a07",
  "BUSINESS_PHRASE": "habit giant wrist east wonder thing scheme empty mutual pelican vehicle drink",
  "NODE_ENV":"production"
```

The following describes how to run Base-Business locally
be sure you have started base-node (e.g. port 8080)
1. git clone base-business ( be sure about your branch )
2. npm i
3. npm start

#  Scenario
The following describes how to verify base-business is working
1. Create a new business user (with offer with price e.g 1 CAT), new customer with matched requests and fields are matched to offer's rules
2. Add some fields which will be shared with business
- the field *“eth_wallets”* is required
3. Add record eth_wallets to customer (if you have not done it yet), and add sharable fields
- you can do this by using the engineering Example App
4. Login as the customer and create a Search request using the Example App
5. Match the search request (from customer) and offer (from business) using the Example App
6. Open (customer account) search request and grant access usign the Example App
7. Reward (e.g 1 CAT ) will be paid from business to customer
- you might need to wait for the transaction to be mined
- you can check the status of the transaction by checking ETH address of the Business or the Customer


