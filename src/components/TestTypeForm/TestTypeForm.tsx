/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import EyzyTree, { APIResult } from "eyzy-tree";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { assignTestTypeToSample } from "store/sample";
import { getLists } from "store/testType";
import "./style.css";

/**
 * Component to display the assign test type  to sample form
 */
export function TestTypeForm({ selectedSample, sampleType, open, closeModal }) {
    const dispatch = useAppDispatch();

    const [testTreeApi, setTestTreeApi] = useState<APIResult | null>(null);
    const [listTestTypes, setListTestTypes] = useState<any[]>([]);
    const [testTypeChecked, setTestTypeChecked] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { testTypes, loading } = useAppSelector((state) => state.testType);
    
    /**
     * Handle tree ready
     * @param {*} treeApi
     */
    const handleTreeReady = (treeApi) => {
        setTestTreeApi(treeApi);
    }

    /**
     * Handle submit save
     * @async
     */
    const handleSubmitSave = async () => {
        const selectedBarcodes = selectedSample?.map((item) => item.barcode);
        const newListIds = getListIdChecked(testTypes, testTypeChecked, []);

        let oldListIds = "";
        if (selectedSample?.length === 1) {
            oldListIds = selectedSample?.[0]?.testidlist || "";
        }

        if (newListIds?.join(".") !== oldListIds) {
            setIsSaving(true);
            const assignTestType = await dispatch(assignTestTypeToSample({ barcodes: selectedBarcodes, testidlist: newListIds }));
            if (assignTestType?.meta?.requestStatus === "fulfilled") {
                toast.success('Assign Test type successfully!');
            }
            setIsSaving(false);
            closeModal(true);
        } else {
            closeModal(false);
        }

    };

    useEffect(() => {
        if (sampleType) dispatch(getLists(sampleType));
    }, [sampleType]);

    /**
     * Parse test types
     * @param {Array} arrTestTypes
     * @param {String} selectedTestType
     * @returns {Array}
     */
    const parseTestTypes = (arrTestTypes, selectedTestType) => {
        if (arrTestTypes && Array.isArray(arrTestTypes)) {
            const newArrTestTypes = arrTestTypes.map((item: any) => {
                let itemChilds = item.child || null;
                if (item.child) {
                    itemChilds = parseTestTypes(item.child, selectedTestType);
                }
                return ({
                    text: item.testtypename,
                    itemId: item.testid,
                    child: itemChilds,
                    checked: selectedTestType.includes(item.testid),
                });
            });
            return newArrTestTypes;
        }
        return [];
    }

    useEffect(() => {
        const selectedTestType: number[] = [];
        if (selectedSample?.length === 1) {
            selectedSample?.[0]?.testidlist?.split('.').forEach((item) => {
                if (!isNaN(item * 1)) selectedTestType.push(item * 1);
            });
        }
        const newListTestTypes = parseTestTypes(testTypes, selectedTestType);
        setListTestTypes(newListTestTypes);
        setTestTypeChecked(selectedTestType);
    }, [testTypes, selectedSample, open]);

    /**
     * Get list item
     * @param {Object} item
     * @param {Array} listTest
     * @param {Boolean} checked
     * @returns {Array}
     */
    const getListItem = (item, listTest, checked) => {
        if (checked) {
            if (!listTest.includes(item.itemId)) listTest.push(item.itemId);
            if (item.child && item.child.length > 0) {
                item.child.forEach((childItem) => {
                    getListItem(childItem, listTest, checked);
                });
            }
        } else {
            const indexTest = listTest.indexOf(item.itemId);
            if (indexTest > -1) {
                listTest.splice(indexTest, 1);
            }
            const indexTestParent = item?.parent?.itemId ? listTest.indexOf(item?.parent?.itemId) : -1;
            if (indexTestParent > -1) {
                listTest.splice(indexTestParent, 1);
            }
            if (item.child && item.child.length > 0) {
                item.child.forEach((childItem) => {
                    getListItem(childItem, listTest, checked);
                });
            }
        }
        return listTest;
    };

    /**
     * Get list Id checked
     * @param {Array} arrTestTypes
     * @param {String} selectedTestType
     * @param {Array} listIds
     * @returns {Array}
     */
    const getListIdChecked = (arrTestTypes, selectedTestType, listIds) => {
        if (arrTestTypes && Array.isArray(arrTestTypes)) {
            arrTestTypes.forEach((item: any) => {
                if (selectedTestType.includes(item.testid)) {
                    listIds.push(item.testid);
                }
                if (item.child) {
                    getListIdChecked(item.child, selectedTestType, listIds);
                }
            });
        }
        return listIds;
    }

    /**
     * Handle checked
     * @param {Object} selected
     * @param {Boolean} checked
     */
    const handleChecked = (selected, checked) => {
        let listTest: number[] = [
            ...testTypeChecked,
        ];
        listTest = getListItem(selected, listTest, checked);
        setTestTypeChecked(listTest);
    }

    /**
     * Handle selected
     * @param {Object} selected
     */
    const handleSelected = (selected) => {
        const checked = selected?.checked ? false : true;
        if (testTreeApi) {
            testTreeApi?.set(selected?.id, 'checked', checked);
            handleChecked(selected, checked);
        }
    }

    useEffect(() => {
        testTreeApi?.unselectAll();
    }, [testTypeChecked, testTreeApi]);

    /**
     * Render tree checkbox
     * @type {String}
     */
    const renderTreeCheckbox = useCallback(() => {
        if (listTestTypes?.length > 0) {
            return (
                <EyzyTree
                    onCheck={handleChecked}
                    onSelect={handleSelected}
                    data={listTestTypes}
                    checkable={true}
                    onReady={handleTreeReady}
                />
            );
        }
    }, [listTestTypes, testTypeChecked, handleTreeReady, handleChecked, handleSelected]);

    return (
        <Modal show={open} onHide={() => closeModal(false)} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Analysis to be scheduled</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container fluid className="coc-form-wrapper">
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {renderTreeCheckbox()}
                            <div className="button-group text-center">
                                <Button variant="secondary" type="button" onClick={handleSubmitSave} disabled={isSaving}>
                                    OK
                                </Button>
                                <Button variant="secondary" type="button" onClick={() => closeModal(false)} disabled={isSaving}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Container >
            </Modal.Body>
        </Modal >
    );
}
