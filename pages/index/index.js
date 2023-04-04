import Link from "next/link";

const qs = require("qs");
import { fetchAPI } from "../../lib/api";

export default function Index ({projectsData}) {

  const renderFeaturedImage = (project) => {
    // escolher quem representará, featured ou 1a galeria
    // let imageToDisplay = projeto.featured_image !== null ? projeto.featured_image : projeto.gallery_main[0]
    let {featured_image, title} = project.attributes

    let featuredImageAttributes = featured_image.data.attributes
    let featuredImageSrc = featuredImageAttributes.formats && featuredImageAttributes.formats.large ? featuredImageAttributes.formats.large.url : featuredImageAttributes.url

    return <img src={featuredImageSrc} alt={`Imagem de capa de ${title}`} /> 
  }
  

  return (
    <div className="projects-index">
      <ul>
        {projectsData.map((project, index) => {
          const {title, date, featured_image, slug} = project.attributes
          return (
            <li key={`li-${index}`} className="index-item">
              <Link href={`/#${slug}`} className="index-item-link">
                  <div className="index-item-text">
                    <span className="index-item-year">{date && date.substring(0,4)}</span>
                    <span className="index-item-title">{title}</span>
                  </div>
              </Link>
              <div className="index-item-image-container">
                {renderFeaturedImage(project)}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export async function getStaticProps() {

  // fetch projects data
  const projectsQuery = qs.stringify(
    {
      populate: "featured_image"
    },
    {
      encodeValuesOnly: true,
    }
  );

  const strapiProjectsData = await fetchAPI(`projetos?${projectsQuery}`);
  let projectsData = strapiProjectsData.data;

  // projectsData.forEach((project, index) => {
  //   project.attributes.gallery.slide.forEach((slide, index) => {
  //     let newImagesArray = []
  //     // iterar data (array de imagens dentro de slide)
  //     slide.images.data.forEach((image, index) => {        
  //       // para cada imagem, novo objeto apenas com campos desejados

  //       let newImageObject = {
  //         attributes: {
  //           width: image.attributes.width,
  //           height: image.attributes.height,
  //           url: image.attributes.url,
  //           formats: {}
  //         }
  //       }

  //       if (image.attributes.formats && image.attributes.formats.large !== null && image.attributes.formats.large !== undefined) {
  //         newImageObject.attributes.formats = {
  //           large: {
  //             width: image.attributes.formats.large.width,
  //             height: image.attributes.formats.large.height,
  //             url: image.attributes.formats.large.url,
  //           }
  //         }
  //       }


  //       newImagesArray.push(newImageObject)
  //       slide.images.data = newImagesArray
  //     })
  //   })
  // })

  projectsData.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date))

  return {
    props: { projectsData },
    revalidate: 10,
  };
}