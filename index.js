const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plereka.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    // await client.connect();

    const usersCollection = client.db("assignmentDb").collection("subscribe");
    const trainerCollection = client.db("assignmentDb").collection("trainer");
    const joiningCollection = client.db("assignmentDb").collection("join");
    const classesCollection = client.db("assignmentDb").collection("class");
    const postsCollection = client.db("assignmentDb").collection("posts");

    // posts api
    app.get('/posts',async(req,res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const result = await postsCollection.find().skip(page * size).limit(size).toArray();
      res.send(result); 
    }) 

    app.get('/postscount', async(req,res) => {
      const count = await postsCollection.estimatedDocumentCount();
      res.send({count})
    })

    // Classes api collection
    app.get('/class',async(req,res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    // Joining in the programme
    app.post('/join',async(req,res) => {
      const user = req.body;
      const result = await joiningCollection.insertOne(user);
      res.send(result);
    })

    // apply for trainers api
    app.post('/trainer', async(req,res) => {
      const trainer = req.body;
      const result = await trainerCollection.insertOne(trainer);
      res.send(result);
    })

    // subscribe
    app.post('/subscribe',async(req,res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})