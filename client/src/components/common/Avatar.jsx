import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FcCompactCamera } from "react-icons/fc";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";


function Avatar({type,image,setImage}) {
 
  const[hover,setHover]=useState(false);
  const [isContextMenuVisible,setIsContextMenuVisible]=useState(false);
  const [contextMenduCoordinates,setContextMenuCoordinates]=useState({x:0,y:0});
  const [grabPhoto,setGrabPhoto]=useState(false);
  const [showPhotolibrary,setShowphotolibrary]=useState(false)
  const [showCapturePhoto,setShowCapturePhoto]=useState(false)
  const showContextMenu=e=>{
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCoordinates({x:e.pageX,y:e.pageY})}
    const contextMenuOptions=[
      {name:"Take Photo",callback:()=>{
        setShowCapturePhoto(true)
      }},
      {name:"Choose From library",callback:()=>{
        setShowphotolibrary(true)
      }},
      {name:"Upload Photo",callback:()=>{
       setGrabPhoto(true)
        
      }},
      {name:"Remove Photo",callback:()=>{
        setImage('/default_avatar.png')
      }}
    ]
    const PhotopickerChange =async(e)=>{
      
      const file=e.target.files[0];
      const reader=new FileReader();
      const data=document.createElement('img');
      reader.onload=function(event){
        data.src=event.target.result;
        data.setAttribute("data-src",event.target.result);
        
      }
      reader.readAsDataURL(file);
      setTimeout(()=>{
        setImage(data.src);
      },100)
    } 
    useEffect(()=>{
      if(grabPhoto){
        const data=document.getElementById('photo-picker');
        data.click();
        document.body.onfocus=(e)=>{
        
          setTimeout(() => {
            setGrabPhoto(false);
          }, 1000);
        }
      }
    },[grabPhoto])
  return <>
<div className="flex items-center justify-center">
  <div className="relative h-10 w-10">

  {type==="sm"&&(<Image src={image} alt="avatar" className="rounded-full" fill/>)}
  </div>
  <div className="relative h-14 w-14">

  {type==="lg"&&(<Image src={image} alt="avatar" className="rounded-full" fill/>)}
  </div>
  

  {type==="xl"&&(
    <div className="relative cursor-pointer"
    onMouseEnter={()=>setHover(true)}
    onMouseLeave={()=>setHover(false)}
    >
      <div className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col gap-2 ${hover?'visible':'hidden'}`}
      onClick={e=>showContextMenu(e)}
      id="context-opener">
        <FcCompactCamera className="text-2xl text-white" id="context-opener"
       onClick={e=>showContextMenu(e)} />
        <span
        id="context-opener"
        onClick={e=>showContextMenu(e)}
        >Change <br/>Profile<br/> Photo</span>
      </div>
      <div className="h-60 w-60 flex items-center justify-center">

      <Image src={image} alt="avatar" className="rounded-full" fill/>
      </div>
    </div>)}
  
</div>
{isContextMenuVisible && <ContextMenu 
options={contextMenuOptions}
coordinates={contextMenduCoordinates}
contextMenu={isContextMenuVisible}
setContextMenu={setIsContextMenuVisible}/>}
{showCapturePhoto && <CapturePhoto
setImage={setImage}
hide={setShowCapturePhoto}/>}
{showPhotolibrary && <PhotoLibrary 
setPhoto={setImage}
hidePhotoLibrary={setShowphotolibrary}/>}
{grabPhoto && <PhotoPicker onChange={PhotopickerChange}/>}
  </>;
}

export default Avatar;
