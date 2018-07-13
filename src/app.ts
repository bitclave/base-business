import Business from './Business';
const express = require('express');

express().listen(process.env.PORT || 3000);

const business = new Business();
