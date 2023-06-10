import { useEffect, useState } from "react"
import timeframeData from "../timeframeData"
import domtoimage from 'dom-to-image';
import $ from "jquery"

export default function Card(props){
    
    const [cardFontSize, setCardFontSize] = useState('28px')
    const {songData, inkColor, timeframe, done, fontSizeToInt, setSongData, isDone, setIsDone, marginValue, setMarginValue} = props
    let topOffset, leftOffset, timeframeText, tempMargin

    timeframeData.map(time => {
        if(time.timeframe==timeframe){
            topOffset = time.topOffset
            leftOffset = time.leftOffset
            timeframeText = time.cardText
        }
    })
    
    function calculateMargin(){
        const card = document.getElementById("card")
        if(card != null){
            const children = card.children
            let sumHeight = 0;
        for (let i = 0; i < children.length; i++) {
            const cardChild = children[i];
            if(cardChild.className === "card--text"){
                sumHeight += cardChild.offsetHeight;
            }
        }
        return ((card.offsetHeight-40)-sumHeight)/10
        }
    }

    useEffect(() => {
        console.log(calculateMargin(), marginValue)
        if(songData.length !== 0 && isDone === false && marginValue === 0){
            if(calculateMargin() < 8){
                setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)-1}px`)
            } else
            if(calculateMargin() > 13){
                setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)+1}px`)
            } else {
                setMarginValue(calculateMargin())
            }
        } else
        if(marginValue !== 0 && !isDone){
            setIsDone(true)
            done()
        }
    })

    const songArray = songData.map(song => {
        return <div style={{marginTop: marginValue, marginBottom: marginValue, fontSize: cardFontSize, color:inkColor}} className="card--text">{song}</div>
    })

    return (
        <div className="card" id="card">
          <div style={{color: inkColor, top: topOffset, left: leftOffset}} className="card--timeframe">{timeframeText}</div>
          {songArray}
        </div>
    )
}
