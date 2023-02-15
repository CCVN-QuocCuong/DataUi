import React, { useEffect, useState } from 'react';
import { Row } from 'react-bootstrap';
import "./style.css";

export function ExportPhotoToPdf({ dataExport, photoDetails }) {
    const [photoList, setPhotoList] = useState<any[]>([]);

    /**
     * Get chuck list photo
     * @param {Array} arrPhoto
     * @param {Number} chunk_size
     * @returns {Array}
     */
    const chunkListPhoto = (arrPhoto, chunk_size) => {
        const results: any[] = [];
        while (arrPhoto.length) {
            results.push({ items: arrPhoto.splice(0, chunk_size) });
        }
        return results;
    }

    useEffect(() => {
        let photos: any[] = [];
        if (photoDetails) photos = chunkListPhoto([...photoDetails] || [], 2);
        setPhotoList(photos);
    }, [photoDetails]);

    return (
        <div className="photo-pdf-wrapper">
            <h2 className="report-title">{dataExport?.title || ""}</h2>
            {photoList?.map((photos, idxs) => (
                <Row className={photoDetails?.length > 2 ? "photo-row" : "photo-wrapper"} key={idxs}>
                    {photos?.items?.map((photo, idx) => (
                        <div className={`col-xs-6 photo ${photoDetails?.length > 2 ? "item-2" : "item-1"}`} key={idx}>
                            <img src={photo} alt="" />
                            <div className="description" dangerouslySetInnerHTML={{ __html: dataExport?.[`caption-${idxs * 2 + idx}`] }}></div>
                        </div>
                    ))}
                </Row>
            ))}
        </div>
    );
}