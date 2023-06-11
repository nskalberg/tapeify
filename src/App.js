import { useState, useEffect } from "react";
import Card from "./components/Card";
import axios from "axios";
import colorData from "./data/colorData";
import $ from "jquery";
import domtoimage from "dom-to-image";
import Metadata from "./components/Metadata";

function App() {
  const [metadata, setMetadata] = useState([]);
  const [dateString, setDateString] = useState("");
  const [imageScale, setImageScale] = useState();
  const [isDone, setIsDone] = useState(false);
  const loading = document.getElementById("loading");
  const CLIENT_ID = "063f0ced1a1040038bf1d4f33e5808e4";
  const REDIRECT_URI = window.location.href.replace(/\/\$|\/#$/, "");
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const [timeframe, setTimeframe] = useState("6 MONTHS");
  const [spotify, setSpotify] = useState();
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [responseData, setResponseData] = useState({});
  const [songData, setSongData] = useState([]);
  const [marginValue, setMarginValue] = useState(0);
  const [formData, setFormData] = useState({
    color: "",
    timeframe: "",
  });
  const [activeColor, setActiveColor] = useState("white");
  let inkColor = "";
  let backgroundColor = "";
  const maxImageWidth = 550;
  setColorProperties();

  function fontSizeToInt(fontSize) {
    return parseInt(fontSize.substring(0, fontSize.length - 2));
  }

  function create() {
    const finalImage = document.getElementById("finalImage");
    finalImage != null && finalImage.remove();
    loading.style.display = "flex";
    loading.style.opacity = "1";
    document.getElementById("image--contents").style.display = "block";
    const date = new Date();
    setDateString(
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
    );
    setTimeframe(formData.timeframe);
    setSongData([]);
    setMarginValue(0);
    setIsDone(false);
    getUsername(token);
    getUserData(token);
  }

  function done() {
    const finalImage = document.getElementById("image--container");
    const finalContents = document.getElementById("image--contents");
    finalImage.style.transform = "scale(1)";
    finalContents.style.webkitTransform = "scale(2)";

    $(document).ready(() => {
      setTimeout(() => {
        domtoimage.toPng(finalImage).then(function (dataUrl) {
          domtoimage
            .toPng(finalImage, {
              height: 1100,
              width: 1100,
              style: { paddingTop: "275px" },
            })
            .then(function (dataUrl1) {
              const img = new Image();
              img.src = dataUrl1;
              img.id = "finalImage";
              img.classList.add("image--downloadable");
              finalImage.appendChild(img);
              finalImage.style.transform = `scale(${imageScale})`;
              finalContents.style.webkitTransform = "";
              finalContents.style.display = "none";
              endLoading();
              setTimeout(
                () =>
                  finalImage.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  }),
                500
              );
            });
        });
      }, 1000);
    });
  }

  function setColorProperties() {
    colorData.map((color) => {
      if (color.name === activeColor) {
        inkColor = color.inkColor;
        backgroundColor = color.backgroundColor;
      }
    });
  }

  function startLoading() {
    loading.style.display = "flex";
    loading.style.opacity = "1";
  }

  function endLoading() {
    setTimeout(() => (loading.style.opacity = 0), 500);
    setTimeout(() => (loading.style.display = "none"), 1000);
  }

  //set color props when active color is changed
  useEffect(() => {
    setColorProperties();
  }, [activeColor]);

  function getUserData(token) {
    axios
      .get(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${formData.timeframe}&limit=5&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setResponseData(response.data);
      });
  }

  function getToken(refresh) {
    function checkTokenValidity(token) {
      return axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          return true;
        })
        .catch(() => {
          return false;
        });
    }

    const hash = window.location.hash;
    let tempToken = window.localStorage.getItem("token");

    checkTokenValidity(tempToken).then((result) => {
      if (result === false && hash !== "") {
        tempToken = hash
          .substring(1)
          .split("&")
          .find((elem) => elem.startsWith("access_token"))
          .split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("token", tempToken);
        setToken(tempToken);
      } else if (result === true) {
        setToken(tempToken);
      } else {
        setToken("");
        window.localStorage.removeItem("token");
      }
    });
  }

  function getUsername(token) {
    if (formData.username) {
      setUsername(formData.username.toUpperCase());
      return;
    }
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsername(
          response.data.display_name.toUpperCase().replace(/^\s*[\r\n]/gm, "")
        );
      })
      .catch(() => {});
  }

  useEffect(() => {
    getToken();
    if (maxImageWidth / window.innerWidth > 0.9 && !imageScale) {
      setImageScale((window.innerWidth * 0.9) / 550);
    } else if (!imageScale) {
      setImageScale(1);
    }
    document.getElementById("image--container").style.display = "flex";
  }, []);

  //process response data
  useEffect(() => {
    if (responseData.items !== undefined) {
      setSpotify(true);
      const apiSongTitles = responseData.items.map((song) => {
        let songName = song.name;
        //TRUNCATE SONG DETAILS
        songName = songName.replace(/ - .*/g, "");
        const artist = song.artists[0].name;
        return `${songName.toLowerCase()} - ${artist.toLowerCase()}`;
      });
      setSongData(apiSongTitles);

      const metadataTitles = responseData.items.map((song) => {
        let songName = song.name;
        const artists = song.artists.map((artist) => artist.name);
        return {
          name: songName,
          artists: artists,
          link: song.external_urls.spotify,
        };
      });
      setMetadata(metadataTitles);
    }
  }, [responseData]);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    startLoading();
    document.getElementById("image--contents").style.display = "block";
    const finalImage = document.getElementById("finalImage");
    finalImage != null && finalImage.remove();
    endLoading();
  };

  function handleChange(event) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
    event.target.name === "color" && setActiveColor(event.target.value);
  }

  let formElements;

  if (!token) {
    formElements = (
      <button
        className="form--full"
        onClick={() =>
          (window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read%20user-read-private`)
        }
      >
        login with spotify
      </button>
    );
  } else {
    formElements = (
      <>
        <button className="form--full" onClick={logout}>
          logout
        </button>
        <select
          id="color"
          name="color"
          className="form--left"
          style={{ direction: "rtl" }}
          onChange={handleChange}
          value={formData.color}
        >
          <option value="" disabled selected>
            color
          </option>
          <option value="green">green</option>
          <option value="red">red</option>
          <option value="blue">blue</option>
          <option value="white">white</option>
          <option value="black">black</option>
        </select>
        <select
          name="timeframe"
          onChange={handleChange}
          value={formData.timeframe}
        >
          <option value="" disabled selected>
            timeframe
          </option>
          <option value="short_term">this month</option>
          <option value="medium_term">6 months</option>
          <option value="long_term">all time</option>
        </select>

        <input
          onChange={handleChange}
          name="username"
          className="form--full"
          type="text"
          placeholder="custom name (optional)"
          value={formData.username}
        ></input>
        {formData.color && formData.timeframe && (
          <button className="form--full" onClick={create}>
            create
          </button>
        )}
      </>
    );
  }

  return (
    <div className="main">
      <script
        src="https://code.jquery.com/jquery-3.7.0.js"
        integrity="sha256-JlqSTELeR4TLqP0OG9dxM7yDPqX1ox/HfgiSLBj8+kM="
        crossOrigin="anonymous"
      ></script>
      <header className="App-header">
        <h1>tapeify</h1>
        <div className="form">{formElements}</div>
      </header>
      <div
        id="image--container"
        style={{
          backgroundColor: backgroundColor,
          transform: `scale(${imageScale})`,
          marginTop: `${-(550 - 550 * imageScale) / 2}px`,
          marginBottom: `${-(550 - 550 * imageScale) / 2}px`,
        }}
        className="image--container"
      >
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
          <img
            className="cassette"
            src={require(`./images/cassette_${activeColor}.png`)}
          />
          <div className="tape">
            <img
              style={{ left: "202px" }}
              id="userImage"
              className="tape--image"
              src={require("./images/tape.png")}
            />
            <img
              style={{ left: "317px" }}
              id="dateImage"
              className="tape--date_image"
              src={require("./images/tape_cropped.png")}
            />
            <div
              id="username"
              style={{
                color: inkColor,
                fontSize: "22px",
              }}
              className="tape--text"
            >
              {username}
            </div>
            <div
              id="date"
              style={{
                color: inkColor,
                left: "334px",
              }}
              className="tape--date"
            >
              {dateString}
            </div>
          </div>
        </div>
      </div>
      <Metadata metadata={metadata} spotify={spotify} username={username} />
      <div style={{ display: "none" }} id="loading">
        <img
          className="rotating"
          id="loading-image"
          src={require(`./images/record.png`)}
          alt="Loading..."
        />
      </div>
    </div>
  );
}

export default App;
