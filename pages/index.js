import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

import { fetchAPI } from "../lib/api";
import { markdownToHTML } from "../lib/markdown";
const qs = require("qs");
import ReactFullpage from '@fullpage/react-fullpage';

import Header from "../components/Header";
import Project from "../components/Project";

export default function Home({ homeData, projectsData }) {

  let backgroundImage = homeData.attributes.Fundo.data.attributes.url;

  let initialPageInfos = {
    title: "estúdio lota",
    description: "Fundado em 2020, o Estúdio Lota é um escritório de arquitetura, expografia e design de mobiliário.",
    imageURL: backgroundImage 
  }

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [pageInfos, setPageInfos] = useState(initialPageInfos)

  const asterisksToBold = (string) => {
    let bold = /\*\*(.*?)\*\*/gm;
    let html = string.replace(bold, '<strong>$1</strong>');            
    return html;
  }

  const displayAbout = (string) => {
    let paragraphs = string.split("\n")

    let childrenArray = []
    paragraphs.forEach((paragraph, index) => {
      // add bold
      paragraph = asterisksToBold(paragraph)
      let htmlElement;
      if (index === 0) {
        // paragraph += "<p>+</p>"
        let spanElement = <span dangerouslySetInnerHTML={{ __html: paragraph }}></span>
        let crossOrDot = <p style={detailsOpen ? {fontWeight: "400"} : {fontWeight: "bold"}}>{detailsOpen ? "." : "+"}</p>
        let children = [spanElement, crossOrDot]
        htmlElement = <summary key={index}>{children}</summary>
        
      } else {
        htmlElement = <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
      }
      
      childrenArray.push(htmlElement)
    })
    
    return <details open={detailsOpen} onToggle={() => setDetailsOpen(prevDetailsOpen => !prevDetailsOpen)}>{childrenArray}</details>
  }


  const updatePageInfo = (origin, destination, direction, trigger) => {
    if (destination.index === 0) {
      setPageInfos(initialPageInfos)
      return
    }

    let currentProject = projectsData[destination.index - 1].attributes

    let extractContent = (html) => {
      var span = document.createElement('span');
      span.innerHTML = html;
      return span.textContent || span.innerText;
    }

    let newDescription = currentProject.gallery.slide[0].caption ? extractContent(currentProject.gallery.slide[0].caption) : initialPageInfos.description

    let firstSlide = currentProject.gallery.slide[0].images.data
    let firstSlideFirstImage = firstSlide.length > 0 ? firstSlide[0].attributes : null
    let newImageURL = firstSlideFirstImage !== null ? firstSlideFirstImage.formats && firstSlideFirstImage.formats.large ? firstSlideFirstImage.formats.large.url : firstSlideFirstImage.url : initialPageInfos.imageURL

    let newPageInfos = {
      title: `${currentProject.title} - estúdio lota`,
      description: newDescription,
      image: newImageURL,
    }

    setPageInfos(newPageInfos)
  }

  const renderPage = () => {
    return (
        <ReactFullpage.Wrapper>
          <section
            className="homepage section"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            data-anchor="homepage"
          >
            <div className="about">
              <article
              >
                {displayAbout(homeData.attributes.Sobre)}
              </article>
            </div>
          </section>
          {projectsData.map((project, index) => {
            return <Project project={project} key={`prj-${index}`}></Project>
          })}
        </ReactFullpage.Wrapper>
    )
  }


  return (
    <>
      <Head>
        <title>{pageInfos.title}</title>
        <meta
          name="description"
          content={pageInfos.description}
        />
      </Head>
      <ReactFullpage
        verticalCentered={false}
        slidesNavigation={false}
        credits={false}
        render={renderPage}
        onLeave={updatePageInfo}
      >
      </ReactFullpage>
    </>
  );
}

export async function getStaticProps() {
  // fetch homepage data
  const homeQuery = qs.stringify(
    {
      populate: "*",
    },
    {
      encodeValuesOnly: true,
    }
  );

  const strapiHomeData = await fetchAPI(`home?${homeQuery}`);
  const homeData = strapiHomeData.data;

  // let sobreToHTML = await markdownToHTML(homeData.attributes.Sobre);
  // homeData.attributes.Sobre = sobreToHTML;

  // fetch projects data
  const projectsQuery = qs.stringify(
    {
      populate: "deep",
    },
    {
      encodeValuesOnly: true,
    }
  );

  const strapiProjectsData = await fetchAPI(`projetos?${projectsQuery}`);
  let projectsData = strapiProjectsData.data;

  async function processCaptions(projectsArray) {
    let projectsArrayCopy = [...projectsArray]
    for (const project of projectsArrayCopy) {
        let gallerySlides = project.attributes.gallery.slide
        for (const slide of gallerySlides) {
          if (slide.caption != null) {
            let captionToHTML = await markdownToHTML(slide.caption)
            slide.caption = captionToHTML
          }
        }
      }
    return projectsArrayCopy
  }

  let processedProjectsData = await processCaptions(projectsData)
  projectsData = processedProjectsData

  projectsData.forEach((project, index) => {
    
    project.attributes.gallery.slide.forEach((slide, index) => {
      let newImagesArray = []
      // iterar data (array de imagens dentro de slide)
      slide.images.data.forEach((image, index) => {        
        // para cada imagem, novo objeto apenas com campos desejados

        let newImageObject = {
          attributes: {
            width: image.attributes.width,
            height: image.attributes.height,
            url: image.attributes.url,
            formats: {}
          }
        }

        if (image.attributes.formats && image.attributes.formats.large !== null && image.attributes.formats.large !== undefined) {
          newImageObject.attributes.formats = {
            large: {
              width: image.attributes.formats.large.width,
              height: image.attributes.formats.large.height,
              url: image.attributes.formats.large.url,
            }
          }
        }


        newImagesArray.push(newImageObject)
        slide.images.data = newImagesArray
      })
    })
  })

  projectsData.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date))

  return {
    props: { homeData, projectsData },
    revalidate: 10,
  };
}
