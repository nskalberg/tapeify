import react from "react"

export default function Metadata(props){
    const {metadata, spotify} = props


    // const songs = [
    //     {
    //         name: "song",
    //         artists: "artists"
    //         link: link
    //     },
    //     {},
    //     {}
    // ]

    const metadataElements = metadata.map(song => <a className="metadata--song" href={song.link}>{song.name} - {song.artists.toString()}</a>)


    return (
    <div id="metadata">
        {spotify && <img className="metadata--logo" src={require(`../images/Spotify_Logo_RGB_Black.png`)} />}
        {metadataElements}
    </div>
    )
}