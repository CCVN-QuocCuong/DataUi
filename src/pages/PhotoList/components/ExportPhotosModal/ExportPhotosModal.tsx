import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "hooks";
import { Button, Form, Modal, Row, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { getPhotoDetail, exportPhoto } from "store/photo";
import ExportPhotoToPdf from "../ExportPhotoToPdf";
import "./style.css";

export function ExportPhotosModal({ open, closeModal, photosSelected }) {
    const dispatch = useAppDispatch();
    const [photoDetails, detailLoading] = useAppSelector((state) => [state.photo?.photoDetails, state.photo?.detailLoading]);
    const componentRef = useRef<HTMLDivElement | null>(null);
    const [dataExport, setDataExport] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const {
        register,
        handleSubmit,
    } = useForm({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });

    useEffect(() => {
        const listUrl = photosSelected?.map((it) => ({ url: it.url }));
        dispatch(getPhotoDetail(listUrl));
    }, [dispatch, photosSelected]);

    /**
     * Handle export
     * @async
     * @param {*} data
     */
    const handleExport = async (data) => {
        setDataExport({
            ...data,
        });

        const photos = photosSelected?.map((it, index) => (
            {
                url: it?.url || "",
                paragraph: data?.[`caption-${index}`],
            }
        ));
        const dataExport = {
            title: data?.title || "",
            items: photos,
        }
        setTimeout(() => {
            handleExportDocx(dataExport);
            closeModal();
        }, 2000);
    }

    // Export PDF
    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    //     documentTitle: "Photos",
    // });

    /**
     * Handle download file
     * @param {Object} file
     */
    const downloadFile = (file) => {
        const link = document.createElement("a");
        link.href = `${file}`;
        link.download = 'Download File';
        document.body.appendChild(link);
        link.click();
    }

    /**
     * Handle export Docx file
     * @async
     * @param {Object} data
     */
    const handleExportDocx = async (data) => {
        setIsExporting(true);
        const docxFile = await dispatch(exportPhoto(data));
        setIsExporting(false);
        if (docxFile?.payload?.url) {
            downloadFile(docxFile?.payload?.url);
        }
    }

    return (
        <Modal show={open} onHide={closeModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Export photos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(handleExport)} className="form-export-container" autoComplete="off">
                    {detailLoading ? (
                        <div className="loading-icon">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <div className="form-wrapper">
                            <Form.Group
                                className="form-item"
                                controlId="title"
                            >
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("title")}
                                />
                            </Form.Group>
                            <Row>
                                {photoDetails?.map((photo, index) => (
                                    <Form.Group
                                        className={`${photoDetails?.length > 2 ? "col-sm-6" : "col-sm-12"} form-item`}
                                        controlId={`caption-${index}`}
                                        key={index}
                                    >
                                        <img className="photo-thumbnail" src={photo} alt="" />
                                        <Form.Label>Caption/Figure descriptions</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            {...register(`caption-${index}`)}
                                        />
                                        {/* <CKEditor
                                            id={`caption-${index}`}
                                            editor={ClassicEditor}
                                            config={{
                                                toolbar: ['heading', '|', 'bold', 'italic', 'blockQuote', 'link', 'numberedList', 'bulletedList', '|', 'undo', 'redo']
                                            }}
                                            onChange={(_e, editor) => {
                                                setValue(`caption-${index}`, editor.getData())
                                            }}
                                        /> */}
                                    </Form.Group>
                                ))}
                            </Row>
                            <div className="button-group text-center">
                                <Button variant="secondary" type="submit" disabled={isExporting}>
                                    Export
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
                <div className="export-photos-wrapper">
                    <div ref={componentRef}>
                        <ExportPhotoToPdf dataExport={dataExport} photoDetails={photoDetails} />
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
