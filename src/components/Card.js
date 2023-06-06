import { useEffect, useState } from "react"
import timeframeData from "../timeframeData"
import domtoimage from 'dom-to-image';

export default function Card(props){
    
    const [cardFontSize, setCardFontSize] = useState('28px')
    const [marginValue, setMarginValue] = useState(0)
    const {songData, inkColor, timeframe, done, fontSizeToInt} = props
    let topOffset, leftOffset, timeframeText

    timeframeData.map(time => {
        if(time.timeframe==timeframe){
            topOffset = time.topOffset
            leftOffset = time.leftOffset
            timeframeText = time.cardText
        }
    })

    //Calculate the margin value whenever cardFontSize updates.
    useEffect(() => {
    const card = document.getElementById("card")
    if(card != null){
        const children = card.children
        let sumHeight = 0;
    
        for (let i = 0; i < children.length; i++) {
            const cardChild = children[i];
            if(cardChild.className == "card--text"){
            sumHeight += cardChild.clientHeight;
            }
        }
        setMarginValue(((card.clientHeight-40)-sumHeight)/10)
    }
    }, [songData, cardFontSize])

    //Check and set font size whenever marginValue changes. If in the correct range, call done().
    useEffect(() => {
    if(marginValue != 0){
        if(marginValue < 8){
        setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)-1}px`)
        console.log(cardFontSize)
        } else
        if(marginValue > 13){
        fontSizeToInt(cardFontSize) < 30 && setCardFontSize(prevFontSize => `${fontSizeToInt(prevFontSize)+1}px`)
        } else {
            done()
        }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [marginValue])

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

