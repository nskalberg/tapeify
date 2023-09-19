import react from "react"

export default function Metadata(props){
    const {metadata, spotify, username} = props

    // const songs = [
    //     {
    //         name: "song",
    //         artists: "artists"
    //         link: link
    //     },
    //     {},
    //     {}
    // ]

    const metadataElements = metadata.map(song => (
        <div className="metadata--row">
            <a className="metadata--song" href={song.link}>{song.name}</a>
            <div className="metadata--artist">{song.artists.toString()}</div>
        </div>
    )
    )

        //<img id="metadata--background" src={require("../images/cassette_green.png")} />

    return (
    <div id="metadata">
        
        <div id="metadata--header">
            {spotify && <img className="metadata--logo" src={require(`../images/Spotify_Logo_RGB_Black.png`)} />}
            {spotify && <div id="metadata--user">{username.toLowerCase()}</div>}
        </div>
        {metadataElements}
    </div>
    )
}