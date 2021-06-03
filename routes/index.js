var express = require('express');
var db = require('../config/connection');
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectID;
const { CANDIDATE_COLLECTION, SCORE_COLLECTION } = require('../config/collection');
const { response } = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', async(req, res, next) => {
  try{
    let candidates = await db.get().collection(CANDIDATE_COLLECTION).aggregate([
      {
        $lookup: {
          from: 'test_score',
          localField: '_id',
          foreignField: 'Candidate',
          as: 'Scores'
        }
      }, 
      {
        $project: {
          Name: 1,
          Email: 1,
          Scores: {
            $arrayElemAt: ['$Scores.Scores', 0]
          }
        }
      }
    ]).toArray()
    console.log(candidates);
    res.status(200).json(candidates);
  }catch(err){
    res.status(500).json({msg:err.message})
  }
  })


router.post('/addcandidate', (req, res) => {

  let candidate = {
    Name: req.body.Name,
    Email: req.body.Email
  }
  console.log(candidate);


  try {
    db.get().collection(collection.CANDIDATE_COLLECTION).insertOne(candidate).then((response) => {
      res.json(response.ops[0])
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: err.message })
  }

})

router.post('/addscore/:id', (req, res) => {
  console.log(req.body);
  let testScores = {
    Candidate: objectId(req.params.id),
    Scores: {
      Test1:  parseInt(req.body.Test1) ,
      Test2: parseInt(req.body.Test2),
      Test3: parseInt(req.body.Test3)
    },
    Total:parseInt(req.body.Test1+req.body.Test2+req.body.Test3)
  }
  try {
    db.get().collection(collection.SCORE_COLLECTION).insertOne(testScores).then((response) => {
      res.json(response.ops)
    })
  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

router.get('/topscorer', async (req, res) => {
  try {
    let topper = await db.get().collection(collection.SCORE_COLLECTION).aggregate([
      {
        $sort:{
          Total:-1
        }
      },
      {
        $limit:1
      },
      {
        $lookup:{
          from:collection.CANDIDATE_COLLECTION,
          localField:'Candidate',
          foreignField:'_id',
          as:"candidate"
        }
      },
      {
        $project:{
          _id:0,
          candidate:{
            $arrayElemAt: ['$candidate', 0]
          },
          Scores:1
        }
      }
    ]).toArray()
    console.log(topper);
    res.status(200).json(topper)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

router.get('/average', (req, res) => {
  try{
    db.get().collection(collection.SCORE_COLLECTION).aggregate([
      {
        $group:{
          _id:0,
          Test1avg:{$avg:'$Scores.Test1'},
          Test2avg:{$avg:'$Scores.Test2'},
          Test3avg:{$avg:'$Scores.Test3'}
        }
      },
      {
        $project:{
          _id:0,
          Test1avg:{$round:['$Test1avg',1]},
          Test2avg:{$round:['$Test2avg',1]},
          Test3avg:{$round:['$Test3avg',1]}
        }
      }
    ])
    .toArray()
    .then((response)=>{
      console.log(response);
      res.status(500).json(response)
    })
  }catch(err){
    res.status(500).json({msg:err.message})
  }
})



module.exports = router;
