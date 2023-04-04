import { useState, useEffect, useRef } from "react"

export default function Project ({project}) {
  const {title, location, date, infos, gallery, slug} = project.attributes

  let defaultMargin = 6

  const [sliderIndex, setSliderIndex] = useState(0)
  const [sliderOffset, setSliderOffset] = useState(0)
  const [offsetValues, setOffsetValues] = useState([])

  const slidesRefs = useRef(new Array())
  const infoBox = useRef(null)

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []); 
    return windowSize;
  }

  const windowSize = useWindowSize()
  const isMobile = windowSize.width <= 600

  const calculateOffsetValues = (gallery) => {
    if (gallery.slide == undefined) return
    if (windowSize == undefined) return
    let offsets = []

    gallery.slide.forEach((slide, index) => {
      let offset;
      let currentSlideElement = slidesRefs.current[index]
      let marginInline = getComputedStyle(currentSlideElement).marginInline
      let marginsArray = marginInline.split(" ")
      let marginNumbers = marginsArray.map(margin => parseInt(margin, 10))
      let slideMargins = marginNumbers.length === 2 ? marginNumbers[0] + marginNumbers[1] : marginNumbers[0] * 2
      offset = currentSlideElement.offsetWidth + slideMargins
      offsets.push(offset)
    })
    return offsets
  }

  useEffect(() => {
    setOffsetValues(calculateOffsetValues(gallery))
  }, [])


  const slidePrev = () => {
    if (sliderIndex === 0) return
    if (sliderIndex === 1) {
      setSliderOffset(0)
    } else {
      setSliderOffset(sliderOffset - offsetValues[sliderIndex])
    }
    setSliderIndex(sliderIndex - 1)
  }

  const slideNext = () => {
    if (sliderIndex === gallery.slide.length - 1) return
    if (sliderIndex === 0) {
      setSliderOffset(sliderOffset + offsetValues[sliderIndex + 1] - 0.20 * windowSize.width)
    } else {
      setSliderOffset(sliderOffset + offsetValues[sliderIndex + 1])
    }
    setSliderIndex(sliderIndex + 1)
  }

  const captionStyles = (slide, index) => {
    let style = {}
    style.transition = "opacity 0.5s"
    if (slide.paragraph_size != null) {
      style.width = slide.paragraph_size + "%"
    }
    
    // if (index < sliderIndex) {
    //   style.opacity = "0%"
    // }

    return style
  }

  const slideStyles = (slide, index) => {
    let style = {}
    // alinhamento caption
    if (slide.text_align != null) {
      slide.text_align === "esquerda" ? style.alignItems =  "flex-start" : style.alignItems =  "flex-end"
    }
    // margens slide
    slide.slide_margin != null ? style.marginInline = `${slide.slide_margin}em` : style.marginInline = `${defaultMargin}em`
    // margem esquerda 1o slide
    if (index === 0) style.marginLeft = "0"
    return style
  }

  const slideImagesClassName = (slide) => {
    let className = "slide-images "
    if (slide.images_display !== null) {
      className += slide.images_display
    }
    if (slide.caption === null) {
      className += " no-captions"
    }

    return className
  }

  return (
    <section className="project section" data-anchor={slug}>
      <div className="project-gallery">
        <button className="btn btn-prev" onClick={slidePrev} style={sliderIndex === 0 ? {display: "none"} : {display: "block"}}></button>
        <button className="btn btn-next" onClick={slideNext} style={sliderIndex === gallery.slide.length - 1 ? {display: "none"} : {display: "block"}}></button>
        <div className="slider" style={{transform: `translateX(-${sliderOffset}px)`}}>
          {gallery.slide.map((slide, index) => {
            return (
              <div className="project-slide" key={slide.id} style={slideStyles(slide, index)} ref={(element) => slidesRefs.current.push(element)}>
                <div className={slideImagesClassName(slide)}>
                  {slide.images.data.map((image, index) => {
                    let {attributes} = image
                    return <img src={attributes.formats && attributes.formats.large ? attributes.formats.large.url : attributes.url} key={`img-${index}`}></img>
                  })}
                </div>
              {slide.caption !== null && <div className="slide-captions"  dangerouslySetInnerHTML={{__html: slide.caption}} style={captionStyles(slide, index)}>
                </div>
              }
              </div>
            )
          })}
        </div>
      </div>
      <div className="project-infobox" ref={infoBox}>
        <h3>{title}</h3>
        <div className="project-infos">
          <div>
            <ul>
              <li>{location}</li>
              {date && <li>{date.substring(0,4)}</li>}
              {infos.map((info, index) => {
                return <li key={`info-${index}`}>{info.info}</li>
              })}
            </ul>
          </div>
        </div>
      </div>

      {isMobile &&
      <details className="project-infobox-mobile">
        <summary><h3>{title}</h3></summary>
        <div className="project-infos">
          <div>
            <ul>
              <li>{location}</li>
              {date && <li>{date.substring(0,4)}</li>}
              {infos.map((info, index) => {
                return <li key={`info-${index}`}>{info.info}</li>
              })}
            </ul>
          </div>
        </div>
      </details>
      }
    </section>
  )
}