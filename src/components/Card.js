import { useEffect, useState } from "react"
import timeframeData from "../data/timeframeData"

export default function Card(props){
    
    const [cardFontSize, setCardFontSize] = useState('28px')
    const {songData, inkColor, timeframe, done, fontSizeToInt, isDone, setIsDone, marginValue, setMarginValue} = props
    let topOffset, leftOffset, timeframeText

    timeframeData.map(time => {
        if(time.timeframe===timeframe){
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
        const currentMargin = calculateMargin()
        if(songData.length !== 0 && !isDone && marginValue === 0){
            if(currentMargin < 8){
                setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)-1}px`)
            } else
            if(currentMargin > 13){
                setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)+1}px`)
            } else {
                setMarginValue(currentMargin)
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

