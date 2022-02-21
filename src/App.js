import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { isValidUrl } from "./helpers";
import { BiSearchAlt, BiRefresh, BiCloudDownload } from "react-icons/bi";
import "./css/index.css";

function App() {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState(null);
  const [vidData, setVidData] = useState(null);
  const [mode, setMode] = useState("search");
  const [options, setOptions] = useState([]);
  const [selectedVid, setSelectedVid] = useState(null);

  const handleTextChange = (e) => {
    setUrl(e.target.value);
    setErr(null);
  };

  const searchURL = (url) => {
    if (!url.length) {
      setErr("Please enter a valid URL");
      return;
    }

    if (!isValidUrl(url)) {
      setErr("URL Formatting Error: Please enter a valid URL");
      return;
    }

    axios
      .get(`[YOUR BACKEND HOST - I USED HEROKU]/search?URL=${url}`)
      .then((res) => {
        setVidData(res.data);
        setMode("clear");
      })
      .catch((err) => setErr(err.message));
  };

  const clearAll = () => {
    setUrl("");
    setVidData(null);
    setMode("search");
    setErr(null);
    setOptions([]);
    setSelectedVid(null);
  };

  const downloadVideo = (vid) => {
    window.location.href = `https://[YOUR BACKEND HOST - I USED HEROKU]/download?title=${vid.value.title}&url=${vid.value.url}&mp3=${vid.mp3}`;
  };

  useEffect(() => {
    const newOptions = [];
    vidData &&
      vidData.formats.map((format, idx) =>
        newOptions.push({
          value: {
            title: vidData.details.title,
            url: vidData.details.video_url,
          },
          label: format.contentLength
            ? `${format.qualityLabel} (${(
                Number(format.contentLength) /
                1000 /
                1000
              ).toFixed(2)}MB)`
            : format.qualityLabel,
          mp3: false,
        })
      );

    setOptions([...options, ...newOptions]);
  }, [vidData]);

  useEffect(() => {
    vidData &&
      options.length === vidData.formats.length &&
      setOptions([
        ...options,
        {
          value: {
            title: vidData.details.title,
            url: vidData.details.video_url,
          },
          label: "mp3",
          mp3: true,
        },
      ]);
  }, [vidData, options]);

  // useEffect(() => {
  //   console.log(selectedVid);
  // }, [selectedVid]);

  return (
    <div className="App">
      <h1 className="heading">YouTube Video Downloader</h1>
      <div className="form">
        <input
          className={`${mode === "clear" ? "unselectable" : "URL-input"}`}
          type="text"
          placeholder="Video URL (e.g., https://www.youtube.com/watch?v=B4JCehDOy54)"
          value={url}
          onChange={handleTextChange}
          readOnly={mode === "clear" ? true : false}
        />
        <button
          className={`convert-button ${mode}`}
          onClick={() => (mode === "search" ? searchURL(url) : clearAll())}
        >
          {mode === "search" ? <BiSearchAlt /> : <BiRefresh />}
        </button>
      </div>
      {err && <p className="error-message">{err}</p>}
      {vidData && (
        <div className="vid-details-container">
          {/** Video Thumbnail */}
          <img
            className="vid-thumbnail"
            src={`${
              vidData.details.thumbnails[vidData.details.thumbnails.length - 1]
                .url
            }`}
            alt={`${vidData.details.title}`}
          />

          {/** Video Details */}
          <div className="vid-details-inner-container">
            {/** Title */}
            <h4>{vidData.details.title}</h4>
            {/** Author */}
            <a
              href={vidData.details.author.external_channel_url}
              target="_blank"
              rel="noreferrer"
            >
              {vidData.details.author.name}
            </a>
            {/** Runtime */}
            <p>
              <strong>Approx. Runtime:</strong>{" "}
              {Number(vidData.formats[0].approxDurationMs / 1000 / 60)
                .toFixed(2)
                .replace(".", ":")}
            </p>
            {/** Link Dropdown & Download Button */}
            <div id="vid-actions-container">
              <Select
                className="vid-links-select"
                name="vid-links-select"
                defaultValue={{ value: 0, label: "Select a format..." }}
                options={options}
                styles={customStyles}
                onChange={setSelectedVid}
              />

              {selectedVid && (
                <button
                  id="vid-download-button"
                  onClick={() => {
                    console.log(selectedVid);
                    downloadVideo(selectedVid);
                  }}
                >
                  Download&nbsp;
                  <BiCloudDownload />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const customStyles = {
  singleValue: (provided, state) => ({
    ...provided,
    color: "#fff",
  }),
  control: (provided, state) => ({
    ...provided,
    background: "#490076",
    height: 41,
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "#fff" : "#333",
    padding: 20,
  }),
};

export default App;
