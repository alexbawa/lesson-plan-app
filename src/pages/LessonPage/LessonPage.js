import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { useParams, Link } from "react-router-dom";
import { getUrl } from "aws-amplify/storage";
import { getLessonPlanByID } from "../../util/dynamo";
import Header from "../../components/Header/Header";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./LessonPage.css";

const LessonPage = () => {
    const { lessonID } = useParams();
    const [pdfLink, setPDFLink] = useState(null);
    const [lessonMetadata, setLessonMetadata] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    useEffect(() => {
        async function getAndSetLessonPlanInfo () {
            try {
                const urlResult = await getUrl({key: lessonID});
                const metadataResult = await getLessonPlanByID(lessonID);
                setPDFLink(urlResult.url.href)
                setLessonMetadata(metadataResult);
            } catch (error) {
                console.error(error)
            }
        }

        getAndSetLessonPlanInfo();
    }, [lessonID])

    const nextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber+1)
        }
    }

    const previousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber-1)
        }
    }

    const addPrevValidityClass = () => {
        if (pageNumber === 1) {
          return 'invalid';
        }
        return '';
      }
  
    const addNextValidityClass = () => {
    if (pageNumber === numPages) {
        return 'invalid';
    }
    return '';
    }

    const renderLessonInfo = () => {
        try {
            if(pdfLink && lessonMetadata) {
                return (
                    <div className="lesson-outer-container">
                        <div className="lesson-metadata-container">
                            <p className="lesson-title">{lessonMetadata.lesson_title}</p>
                            <Link className="download-button" to={pdfLink}>Download</Link>
                        </div>
                    
                        <div className="lesson-pdf-container">
                            <Document classname="pdf-viewer" file={pdfLink} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={pageNumber}/>
                            </Document>
                            <div className="pdf-navigation-container">
                                <p className="pdf-page-info">{pageNumber} of {numPages}</p>
                                <div className="navigation-button-container">
                                    <button className={`button-half-left ${addPrevValidityClass()}`} onClick={previousPage}>Previous</button>
                                    <button className={`button-half-right ${addNextValidityClass()}`}onClick={nextPage}>Next</button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                )
            } else {
                return <p>Retrieving lesson plan information ...</p>
            }
        } catch (error) {
            console.log(error);
            renderLessonInfo();
        }
    }
    
    return (
        <div className="page-container">
            <Header/>
            {renderLessonInfo()}
        </div>
    )
}

export default LessonPage;