import React, { useEffect } from "react";
import { FaMicrophone, FaPause, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { useState,useRef } from "react";
import { useStateProvider } from "@/context/StateContext";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";


function CaptureAudio({hide}) {
  const [isrecording, setisrecording] = useState(false);
  const [recordedAudio, setrecordedAudio] = useState(null);
  const [waveform, setwaveform] = useState(null);
  const [recordingDuration, setrecordingDuration] = useState(0)
  const [currentPlayBackTime, setcurrentPlayBackTime] = useState(0);
  const [renderedAudio,setRenderedAudio]=useState(null)
  const [totalDuration, settotalDuration] = useState(0);
  const [isPlaying, setisPlaying] = useState(false)
  const audioRef =useRef(null);
  const mediaRecorderRef =useRef(null);
  const waveformRef =useRef(null);
  const [{userInfo,currentChatUser,socket},dispatch]=useStateProvider();
  useEffect(()=>{
    let interval;
    if(isrecording){
      interval=setInterval(() => {
        setrecordingDuration((previousDuration)=>{
          settotalDuration(previousDuration+1);
          return previousDuration+1;
        })
        
      }, 1000);
    }
    return ()=>{
      clearInterval(interval)
    }
  },[isrecording])
  useEffect(()=>{
    const wavesurfer=WaveSurfer.create(
      {
        container:waveformRef.current,
        waveColor:"#ccc",
        progressColor : "#4a9eff",
        barWidth:2,
        height:30,
        responsive:true
      }
    )
    setwaveform(wavesurfer)
    wavesurfer.on("finish",()=>{
      setisPlaying(false)
    })
return ()=>{
  wavesurfer.destroy()
}
  },[]);
  useEffect(()=>{
    if(waveform){
      handleStartRecording();
    }
  },[])
  const handleStartRecording =()=>{
    setrecordingDuration(0);
    setrecordedAudio(null);
    setcurrentPlayBackTime(0);
    settotalDuration(0);
    setisrecording(true);
    navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
      const mediaRecorder=new MediaRecorder(stream);
      mediaRecorderRef.current=mediaRecorder;
      
      audioRef.current.srcObject=stream;
      const chunks=[]
      mediaRecorder.ondataavailable=e=>chunks.push(e.data);
      mediaRecorder.onstop=()=>{
      const blob = new Blob(chunks,{type:'audio/ogg codec=opus'});

      const audioUrl=URL.createObjectURL(blob);
      const audio=new Audio(audioUrl)
      setrecordedAudio(audio)
      
      waveform.load(audioUrl)
    }
      mediaRecorder.start()
    }).catch(err=>{
      console.log("Errror Accessing Microphone",err)
    })
  };
  const handleStopRecording =()=>{
    
    if(mediaRecorderRef.current && isrecording){
      mediaRecorderRef.current.stop();
      setisrecording(false)
      waveform.stop()
    }
    const audioChunks=[];
   
    mediaRecorderRef.current.addEventListener("dataavailable",(event)=>{
      audioChunks.push(event.data)
    })
    mediaRecorderRef.current.addEventListener("stop",()=>{
      const audioBlob=new Blob(audioChunks,{type:"audio/mp3"});
      const audioFile=new File([audioBlob],"recording.mp3");
      setRenderedAudio(audioFile)
    })
  };
  const handlePlayRecording=()=>{
    
    if(recordedAudio){
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setisPlaying(true)
    }
  };
  useEffect(()=>{
    if(recordedAudio){
      const updatePlaybackTime=()=>{
        console.log("testing",recordedAudio.currentTime)

        setcurrentPlayBackTime(recordedAudio.currentTime)
      
      recordedAudio.addEventListener("timeupdate",updatePlaybackTime);

    }
    console.log(recordedAudio)
    return ()=>{
      recordedAudio.removeEventListener("timeupdate",updatePlaybackTime);
    }}
  },[recordedAudio])
  const handlePauseRecording =()=>{
    waveform.stop();
    recordedAudio.pause();
    setisPlaying(false)

  };
  const sendRecording=async()=>{
    console.log("sending")
    try {
      const formData=new FormData();
      formData.append("audio",renderedAudio);
      const response= await axios.post(ADD_AUDIO_MESSAGE_ROUTE,formData,{
        headers:{
          "Content-Type":"multipart/form-data"
        },
        params :{
          from : userInfo.id,
          to : currentChatUser.id,
        },
      })
      if(response.status===201){
      hide()
          socket.current.emit("send-msg",{
            to:currentChatUser?.id,
            from : userInfo?.id,
            message : response.data.message
          })
          dispatch({
            type : reducerCases.ADD_MESSAGE,
            newMessage :{
              ...response.data.message
            },
            fromSelf : true
          })
          
      }
      
    } catch (error) {
      console.log(error)
    }
  }
const formartTime = time=>{
  
  if(isNaN(time)) return "00:00";
  const minutes =Math.floor(time/60);
  
  const seconds=Math.floor(time%60);
  return `${minutes.toString().padStart(2,"0")} : ${seconds.toString().padStart(2,"0")}`

}

  return <div className="flex text-2xl w-full justify-end items-center">
    <div className="pt-1">
      <FaTrash className="text-panel-header-icon " onClick={()=>hide()}/>
    </div>
    <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg"
    >
      
      {isrecording?
      (<div className="text-red-500 animate-pulse w-60 text-center">
      Recording <span>{recordingDuration}</span>
    </div>) :(<div>{
      recordedAudio && 
      <>
      {!isPlaying ? <FaPlay onClick={handlePlayRecording} className="cursor-pointer"/> :<FaStop onClick={handlePauseRecording}/>}
      </>
      }</div>)
     
      }
      <div className="w-60 " ref={waveformRef} hidden={isrecording}/>
      {
        recordedAudio && isPlaying && (
          <span>{formartTime(currentPlayBackTime)}</span>
        )
       
      }
      {
         recordedAudio && !isPlaying && (<span>{formartTime(totalDuration)}
          </span>)
      }
      <audio ref={audioRef} hidden/>
      </div>
      <div className="mr-4">
        {
          !isrecording ?<FaMicrophone className="text-red-500" onClick={handleStartRecording}/> :<FaPauseCircle className="text-red-500"
          onClick={handleStopRecording}/>
        }
      </div>
      <div><MdSend className="text-panel-header-icon cursor-pointer mr-4 " title="send" onClick={sendRecording}/></div>
   
  </div>;
}

export default CaptureAudio;
