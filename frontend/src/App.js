import axios from "axios";
import './App.css';
import React, { useState, useEffect } from "react";
import stubs from "./defaultStubs";
import moment from "moment";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [output, setOutput] = useState("");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect( ()=> {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  useEffect( ()=> {
    setCode(stubs[language]);
  }, [language]);

  const setDefaultLanguage = ()=> {
    localStorage.setItem("default-language", language);
    if(language === "py"){
      window.alert("Python set as default language.");
    }
    else if(language === "c"){
      window.alert("C set as default language.");
    }
    else{
      window.alert("C++ set as default language.");
    }
  }

  const renderTimeDetails = ()=> {
    if(!jobDetails){ 
      return ""; 
    }
    let result = "";
    let {submittedAt, completedAt, startedAt} = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted At: ${submittedAt}.  `;

    if(!completedAt || !startedAt){
      return result;
    }

    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, "seconds", true);
    result += `Execution Time: ${executionTime}s.`;

    return result;
  }

  const handleSubmit = async()=>{
    const payload = { 
      language, 
      code,
    }

    try {
      setJobId("");
      setStatus("");
      setOutput("");
      setJobDetails(null);

      const {data} = await axios.post("http://localhost:5000/run", payload);
      console.log(data);
      setJobId(data.jobId); 

      let intervalId;

      intervalId = setInterval( async()=>{
        const { data: dataRes } = await axios.get("http://localhost:5000/status", {params: {id: data.jobId}});

        const {success, job, error} = dataRes;
        console.log(dataRes);

        if(success){
          const { status: jobStatus, output: jobOutput } = job || {};
          setStatus(jobStatus);
          setJobDetails(job);
          if(jobStatus === "pending") return;
          setOutput(jobOutput);
          clearInterval(intervalId);
        }
        else{
          setStatus("Error: Please try again!");
          console.log(error);
          setOutput(error);
          clearInterval(intervalId);
        }
        console.log(dataRes);
      }, 1000);

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <h1>Online Code Editor</h1>
      <div className="">
        <label htmlFor="">Language: </label>
        <select value = {language} onChange = {(e) => {
          let response = window.confirm("Switching the Language will remove your existing code! Do you want to continue?");
          if(response){
            setLanguage(e.target.value)
          }
          }}>
          <option value="cpp">C++</option>
          <option value="py">Python</option>
          <option value="c">C</option>
        </select>
      </div>
      <br />
      <div className="">
        <button onClick={setDefaultLanguage}>Set Default</button>
      </div>
      <br />
      <textarea name="" id="" cols="75" rows="20" value = {code} onChange = {(e)=>{setCode(e.target.value)}}></textarea>
      <br />
      <button type="submit" onClick={handleSubmit}>Submit</button>
      <br />
      <p>{status}</p>
      <p>{jobId && `Job ID: ${jobId}`}</p>
      <p>{renderTimeDetails()}</p>
      <p>{output}</p>
    </div>
  );
}

export default App;
