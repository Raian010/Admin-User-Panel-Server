const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

    const subscribeCollection = client.db("assignmentDb").collection("subscribe");
    const trainerCollection = client.db("assignmentDb").collection("trainer");
    const joiningCollection = client.db("assignmentDb").collection("join");
    const classesCollection = client.db("assignmentDb").collection("class");
    const postsCollection = client.db("assignmentDb").collection("posts");
    const trainersCollection = client.db("assignmentDb").collection("trainers");
    const usersCollection = client.db("assignmentDb").collection("users");

    // Auth Middleware

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    }); 

    const verifyToken = (req, res, next) => {
      console.log(req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "access forbidden" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "forbidden" });
        }
        req.decoded = decoded;
        next(); 
      });
    };

    

    // Users Registering api

    app.get("/users",async(req,res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    // Checking is Admin
    app.get("/users/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {  
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });


    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.post("/users",async(req,res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // Already trainers api
    app.get('/trainers',async(req,res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    }) 

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

    app.get('/join/:email',async(req,res) => {
      const email = req.params.email;
      const query = {email: email}
      const result = await joiningCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/join',async(req,res) => {
      const user = req.body;
      const result = await joiningCollection.insertOne(user);
      res.send(result);
    })

    // apply for trainers api

    app.get('/trainer',async(req,res) => {
      const result = await trainerCollection.find().toArray();
      res.send(result);
    })

    app.post('/trainer', async(req,res) => {
      const trainer = req.body;
      const result = await trainerCollection.insertOne(trainer);
      res.send(result);
    })

    // subscribe

    app.get('/subscribe',async(req,res) => {
      const result = await subscribeCollection.find().toArray();
      res.send(result)
    })

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