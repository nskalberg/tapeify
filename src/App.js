import { useState, useEffect } from 'react'
import Card from "./components/Card"
import axios from "axios"
import colorData from "./colorData"
import $ from 'jquery'; 
import domtoimage from 'dom-to-image'
import Metadata from "./components/Metadata"
import html2canvas from 'html2canvas';



function App() {
  const [metadata, setMetadata] = useState([])
  const [dateString, setDateString] = useState("")
  const [imageScale, setImageScale] = useState() 
  const [isDone, setIsDone] = useState(false)
  const loading = document.getElementById("loading")
  const CLIENT_ID = "063f0ced1a1040038bf1d4f33e5808e4"
  const REDIRECT_URI = window.location.href.replace(/\/\$|\/#$/, "")
  console.log(REDIRECT_URI)
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const [timeframe, setTimeframe] = useState("6 MONTHS")
  const [spotify, setSpotify] = useState()
  const [username, setUsername] = useState("")
  const [token, setToken] = useState("")
  const [responseData, setResponseData] = useState({})
  const [songData, setSongData] = useState([])
  const [marginValue, setMarginValue] = useState(0)
  const [formData, setFormData] = useState({
    color:"white",
    timeframe:"short_term"
  })
  const [activeColor, setActiveColor] = useState('white')
  let inkColor = ""
  let backgroundColor = ""
  let usernameOffset
  const maxImageWidth = 550;
  setColorProperties()

  function fontSizeToInt(fontSize){
    return parseInt(fontSize.substring(0, fontSize.length - 2))
  }

  function create(){
    const finalImage = document.getElementById("finalImage")
    finalImage != null && finalImage.remove()
    console.log(token)
    loading.style.display = "flex";
    loading.style.opacity = "1"
    document.getElementById("image--contents").style.display = "block"
    const date = new Date();
    setDateString((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear())
    setTimeframe(formData.timeframe)
    setActiveColor(formData.color)
    setSongData([])
    setMarginValue(0)
    setIsDone(false)
    getUsername(token)
    getUserData(token)
  }

  function done(){
    const finalImage=document.getElementById("image--container")
    const finalContents = document.getElementById("image--contents")
    const tempScale = imageScale
    finalImage.classList.add("render--transform")
    finalImage.style.transform = "scale(2) translate(137.5px, 137.5px)"
    finalImage.style.marginTop = "0px"
    finalImage.style.marginBottom = "0px"
    
    setTimeout(() => { domtoimage.toPng(finalImage, {style: {height:"1100px", width: "1100px"}, height: 1100, width: 1100})
    .then(function (dataUrl) {
      domtoimage.toPng(finalImage, {style: {height:"1100px", width: "1100px"}, height: 1100, width: 1100}).then(function (dataUrl1){
        //TODO -- make this a function from APP and pass down to this.
        const img = new Image();
        img.src = dataUrl1;
        img.id = "finalImage"
        img.classList.add("image--downloadable")
        //finalImage.innerHTML = ""
        finalImage.appendChild(img);
        finalImage.style.transform = `scale(${imageScale})`
        finalImage.style.marginTop = 
        finalImage.style.marginBottom = `${-(550-(550*imageScale))/2}px`
        finalImage.style.marginTop = `${-(550-(550*imageScale))/2}px`

        finalContents.style.display = "none"
        finalImage.classList.remove("render--transform")
        endLoading()
        
      })

    })}, 100)

  }

  function setColorProperties(){
    colorData.map(color => {
      if(color.name===activeColor){
        inkColor = color.inkColor
        backgroundColor = color.backgroundColor
        usernameOffset = color.userOffset
      }
    })
  }

  function startLoading(){
    loading.style.display = "flex";
    loading.style.opacity = "1"
  }

  function endLoading(){
    setTimeout(() => loading.style.opacity = 0, 500)
    setTimeout(() => loading.style.display = "none", 1000)
  }

  //set color props when active color is changed
  useEffect(() => {
    setColorProperties()
  }, [activeColor])

  function getUserData(token){
    axios.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${formData.timeframe}&limit=5&offset=0`, {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      setResponseData(response.data);
    });
  }

  function getToken(refresh){
    function checkTokenValidity(token) {
      return axios.get('https://api.spotify.com/v1/me', {
          headers: {
              Authorization: `Bearer ${token}`
          }
        }).then((response) => {return true
        }).catch(() => {
          return false
        })
    }

    const hash = window.location.hash
    let tempToken = window.localStorage.getItem("token")
    checkTokenValidity(tempToken).then(result => {
      if(result === false && hash != ""){
        tempToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
        window.location.hash = ""
        window.localStorage.setItem("token", tempToken)
        setToken(tempToken)
      } else if(result === true){
        setToken(tempToken)
      } else {
        setToken("")
        window.localStorage.removeItem("token")
      }
    })
  }

  function getUsername(token){
    axios.get('https://api.spotify.com/v1/me', {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      setUsername(response.data.display_name.toUpperCase())
    }).catch(() => {

    })
  }

  useEffect(() => {
    getToken()

    if(maxImageWidth/window.innerWidth > 0.9 && !imageScale){
      setImageScale((window.innerWidth*0.9)/550)
      console.log((window.innerWidth*0.9)/550)
    } else if (!imageScale) {
      setImageScale(1)
    }
    document.getElementById("image--container").style.display = "block"

  }, [])

  //process response data
  useEffect(() => {
    if(responseData.status == 400){
    }
    
    if(responseData.items != undefined){
      setSpotify(true)
      const apiSongTitles = responseData.items.map(song => {
        let songName = song.name
        //TRUNCATE SONG DETAILS
        songName = songName.replace(/ - .*/g,"")
        const artist = song.artists[0].name
        return `${songName.toLowerCase()} - ${artist.toLowerCase()}`
        })
      setSongData(apiSongTitles)

      const metadataTitles = responseData.items.map(song => {
        let songName = song.name
        const artists = song.artists.map(artist => artist.name)
        return ({
          name: songName,
          artists: artists,
          link: song.external_urls.spotify
        })
      })
      setMetadata(metadataTitles)
      
    }


  }, [responseData])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    startLoading()
    document.getElementById("image--contents").style.display = "block"
    const finalImage = document.getElementById("finalImage")
    finalImage != null && finalImage.remove()
    endLoading()
  }

  function handleChange(event){
    setFormData(prevFormData => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }))
    event.target.name=="color" && setActiveColor(event.target.value)
  }

  function addStyleValues(firstVal, secondVal){
    return `${fontSizeToInt(firstVal)+fontSizeToInt(secondVal)}px`
  }

  return (
    <div className="main">
      <script
  src="https://code.jquery.com/jquery-3.7.0.js"
  integrity="sha256-JlqSTELeR4TLqP0OG9dxM7yDPqX1ox/HfgiSLBj8+kM="
  crossOrigin="anonymous"></script>
      <header className="App-header">
        <h1>TAPEIFY</h1>
        <div className="form">
          {!token ?
              <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read%20user-read-private`}>Login
                  to Spotify</a>
              : <button onClick={logout}>Logout</button>}
          <select name="color" onChange={handleChange} value={formData.color}>
            <option value="green">Green</option>
            <option value="red" >Red</option>
            <option value="blue" >Blue</option>
            <option value="white" >White</option>
            <option value="black" >Black</option>
          </select>
          <select name="timeframe" onChange={handleChange} value={formData.timeframe}>
            <option value="short_term">This Month</option>
            <option value="medium_term" >6 Months</option>
            <option value="long_term" >All Time</option>
          </select>

          <button onClick={create}>CREATE</button>
        </div>
      </header>
      <div id="image--container" style={{backgroundColor: backgroundColor, transform: `scale(${imageScale})`, marginTop: `${-(550-(550*imageScale))/2}px`, marginBottom: `${-(550-(550*imageScale))/2}px`}} className="image--container">
        <div id="image--contents" className="image--container_contents">
          <Card
            songData={songData}
            inkColor={inkColor}
            activeColor={activeColor}
            timeframe={timeframe}
            done={done}
            fontSizeToInt={fontSizeToInt}
            setSongData={setSongData}
            isDone={isDone}
            setIsDone={setIsDone}
            marginValue={marginValue}
            setMarginValue={setMarginValue}
          />
          <img className="cassette" src={require(`./images/cassette_${activeColor}.png`)} />
          <div className="tape">
            <img style={{left: addStyleValues(`195px`, usernameOffset)}} id="userImage" className="tape--image" src={require("./images/tape.png")} />
            <img style={{left: addStyleValues(`310px`, usernameOffset)}} id="dateImage" className="tape--date_image" src={require("./images/tape_cropped.png")} />
            <div id="username" style={{color: inkColor, fontSize: "28px", left: addStyleValues(`224px`, usernameOffset)}} className="tape--text">{username}</div>
            <div id="date" style={{color: inkColor, left: addStyleValues(`389px`, usernameOffset)}} className="tape--date">{dateString}</div>
          </div>
        </div>
      </div>
      <Metadata
        metadata={metadata}
        spotify={spotify}
      />
      <div style={{display: "none"}} id="loading">
        <img className="rotating" id="loading-image" src={require(`./images/record.png`)} alt="Loading..." />
      </div>
    </div>

  )
}

export default App
