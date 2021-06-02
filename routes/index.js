var express = require('express');
var db = require('../config/connection');
var objectId = require('mongodb').ObjectID;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/addcandidate',(req,res)=>{
  res.render('addcandidate')
})

router.get('/addscore',(req,res)=>{
  res.render('addscore')
})

router.get('/topscorer',(req,res)=>{
  res.render('topscorer');
})

router.get('/average',(req,res)=>{
  res.render('average')
})



module.exports = router;
