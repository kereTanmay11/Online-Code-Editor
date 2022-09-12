const express = require("express");
const mongoose = require('mongoose');
const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");
const Job = require("./models/job");
const cors = require("cors");

const app = express();

mongoose.connect('mongodb://localhost:27017/codeEditorApp', err=> {
    if(err){
        console.error(err);
        process.exit(1);
    }
    console.log("Successfully connected to database.")
});

app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(cors());

app.get("/status", async (req, res) => {
    const jobId = req.query.id;
  
    if (jobId === undefined) {
      return res.status(400).json({ success: false, error: "missing id query parameter" });
    }
  
    const job = await Job.findById(jobId);
  
    if (job === undefined) {
      return res.status(400).json({ success: false, error: "couldn't find job" });
    }
  
    return res.status(200).json({ success: true, job });
});

app.post("/run", async(req, res)=> {
    const { language = "cpp" , code } = req.body;
    console.log(language, "Length:", code.length);

    if (code === undefined) {
        res.status(400).json({succes: false, error: "Empty code body"});
    }

    let job;

    try {
        // generating c++/py file
        const filepath = await generateFile(language, code);

        job = await new Job({language, filepath}).save();
        const jobId = job["_id"];
        addJobToQueue(jobId);
        console.log(job);

        res.status(201).json({success:true, jobId});
    } catch(err){
        res.status(500).json({succes: false, err: JSON.stringify(err)});
    }
       
});

app.listen(5000, ()=>{
    console.log("Listening on port 5000");
});