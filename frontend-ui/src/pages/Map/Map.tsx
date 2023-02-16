import UserLayout from "layouts/User";
import React, { useRef, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import EsriConfig from '@arcgis/core/config'
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import Search from "@arcgis/core/widgets/Search";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import esriId from "@arcgis/core/identity/IdentityManager";
import LayerList from "@arcgis/core/widgets/LayerList";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Print from "@arcgis/core/widgets/Print";
import Editor from "@arcgis/core/widgets/Editor";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import TextAreaInput from "@arcgis/core/form/elements/inputs/TextAreaInput";
import PrintTemplate from "@arcgis/core/rest/support/PrintTemplate";
import PrintParameters from "@arcgis/core/rest/support/PrintParameters";
import * as print from "@arcgis/core/rest/print";
import "./style.css";

declare global {
    interface Window {
        example: string;
    }
}

export function TTMap() {
    const mapDiv = useRef(null);

    useEffect(() => {
        if (mapDiv.current) {

            EsriConfig.portalUrl = "https://webapps.tonkinandtaylorgroup.com/arcgis";
            const infoCode = new OAuthInfo({
                // Swap this ID out with registered application ID
                appId: "L2F20keyXjIfC1HV",
                // Uncomment the next line and update if using your own portal
                portalUrl: "https://webapps.tonkinandtaylorgroup.com/arcgis",
                // Uncomment the next line to prevent the user's signed in state
                // from being shared with other apps on the same domain with
                // the same authNamespace value.
                authNamespace: "portal_oauth_inline",
                flowType: "auto", // set to this if using a popup for  signing in.
                popup: false,
                preserveUrlHash: true,
                popupCallbackUrl: "/" // page should be relative to application.
                // Make sure it's updated to handle two-step flow
                // see https://github.com/Esri/jsapi-resources/blob/master/oauth/oauth-callback.html for a sample of this.
            });



            const view = new MapView({
                container: mapDiv.current,
            });
            esriId.registerOAuthInfos([infoCode]);
            esriId.getCredential((infoCode.portalUrl + "/sharing")).then(() => {
                const webmap = new WebMap({
                    portalItem: {
                        id: "9392103e069c47ce9f5810304475f29b"
                    }
                });
                view.map = webmap

                const searchWidget = new Search({
                    view: view
                });
                // Adds the search widget below other elements in
                // the top right corner of the view
                view.ui.add(searchWidget, {
                    position: "top-right",
                    index: 2
                });

                const legend = new Expand({
                    content: new Legend({
                        view: view,
                        style: "card" // other styles include 'classic'
                    }),
                    view: view,
                    expanded: false
                });
                view.ui.add(legend, "bottom-left");

                const basemapGallery = new Expand({
                    content: new BasemapGallery({
                        view: view,
                        container: document.createElement("div")
                    }),
                    view: view,
                    expanded: false
                });
                view.ui.add(basemapGallery, "top-right");

                let siteObservationLayer, hailLayer, ppeControlLayer, disposalLayer;

                view.when(() => {
                    const layerList = new Expand({
                        content: new LayerList({
                            view: view,
                            container: document.createElement("div")
                        }),
                        view: view,
                        expanded: false
                    });

                    view.ui.add(layerList, "top-right");

                    view.ui.add(
                        new Fullscreen({
                            view: view
                        }),
                        "top-left"
                    );

                    // const printWidget = new Expand({
                    //     content: new Print({
                    //         view: view,
                    //         // specify your own print service
                    //         printServiceUrl:
                    //             "https://webapps.tonkinandtaylorgroup.com/mapserver/rest/services/UtilityServices/TT_WebPrintTemplateService/GPServer/TTPrint_ExportWebMap"
                    //     }),
                    //     view: view,
                    //     expanded: false
                    // });

                    // view.ui.add(printWidget, "top-right");

                    view.map.allLayers.forEach((layer) => {
                        if (layer.type === "feature") {
                            console.log(layer.title)
                            switch (layer.title) {
                                case "TT Site Observation":
                                    siteObservationLayer = layer;
                                    break;
                                case "TT HAIL":
                                    hailLayer = layer;
                                    break;
                                case "TT PPE Control":
                                    ppeControlLayer = layer;
                                    break;
                                case "TT Disposal":
                                    disposalLayer = layer;
                                    break;
                            }
                        }
                    });


                    let commentFields = [new FieldElement({
                        fieldName: "category",
                        label: "Category",
                    }),
                    new FieldElement({
                        fieldName: "projectnumber",
                        label: "Project Number *",
                    }),
                    new FieldElement({
                        fieldName: "siteaddress",
                        label: "Site Address *",
                    })
                    ]

                    const editor = new Expand({
                        content: new Editor({
                            view: view,
                            visibleElements: {
                                snappingControls: false
                            },
                            layerInfos: [
                                {
                                    layer: disposalLayer,
                                    formTemplate: new FormTemplate({
                                        title: "T+T Disposal Layer",
                                        description: "Enter all relevant information below",
                                        elements: [...commentFields, new FieldElement({
                                            fieldName: "disposallocation",
                                            label: "Disposal Location",
                                            input: new TextAreaInput({
                                                maxLength: 256
                                            })
                                        })]
                                    })
                                },
                                {
                                    layer: siteObservationLayer,
                                    formTemplate: new FormTemplate({
                                        title: "T+T Site Observation Layer",
                                        description: "Enter all relevant information below",
                                        elements: [new FieldElement({
                                            fieldName: "category",
                                            label: "Category",
                                        }), new FieldElement({
                                            fieldName: "description",
                                            label: "Comment",
                                            input: new TextAreaInput({
                                                maxLength: 256
                                            })
                                        })]
                                    })
                                },
                                {
                                    layer: ppeControlLayer,
                                    formTemplate: new FormTemplate({
                                        title: "T+T PPE Control",
                                        description: "Enter all relevant information below",
                                        elements: [...commentFields, new FieldElement({
                                            fieldName: "disposallocation",
                                            label: "Disposal Location",
                                            input: new TextAreaInput({
                                                maxLength: 256
                                            })
                                        })]
                                    },
                                    )
                                }
                                ,
                                {
                                    layer: hailLayer,
                                    formTemplate: new FormTemplate({
                                        title: "T+T HAIL Annotation",
                                        description: "Enter all relevant information below",
                                        elements: [new FieldElement({
                                            fieldName: "category",
                                            label: "Category",
                                        }),
                                        new FieldElement({
                                            fieldName: "activity",
                                            label: "Activity *",
                                            valueExpression: "category"
                                        }),
                                        new FieldElement({
                                            fieldName: "description",
                                            label: "Comment",
                                            input: new TextAreaInput({
                                                maxLength: 256
                                            })
                                        }),
                                        new FieldElement({
                                            fieldName: "projectnumber",
                                            label: "Project Number *",
                                        }),
                                        new FieldElement({
                                            fieldName: "siteaddress",
                                            label: "Site Address *",
                                        })
                                        ],
                                        expressionInfos: [{
                                            name: "category",
                                            title: "category",
                                            expression: "$feature.category =="
                                        }]
                                    })
                                }]
                        }),
                        view: view,
                        expanded: false
                    });

                    // Add the widget to the view
                    view.ui.add(editor, "bottom-right");

                    view.on("click", function (event) {
                        editor.collapse()
                        //printWidget.collapse()
                        layerList.collapse()
                        basemapGallery.collapse()
                        legend.collapse()
                    });


                    view.ui.add(["loader"], "top-right");
                    let loaderDiv = document.getElementById("loader");
                    if (loaderDiv) loaderDiv.style.display = 'none';

                    view.ui.add(["myOwnPrinterButton"], "top-right");
                    let printerButton = document.getElementById("myOwnPrinterButton");

                    let mapPrintDiv = document.getElementById("mapPrintContainer");
                    if (printerButton) {
                        printerButton.addEventListener("click", () => {
                            if (mapPrintDiv) mapPrintDiv.style.display = 'block';
                        });
                    }


                    let closeBtn = document.getElementById("mapbtnPrintClose");
                    if (closeBtn) {
                        closeBtn.addEventListener("click", () => {
                            if (mapPrintDiv) mapPrintDiv.style.display = 'none';
                        });
                    }


                    let submitPrint = document.getElementById("mapbtnPrintMap");
                    if (submitPrint) {
                        submitPrint.addEventListener("click", () => {

                            if (loaderDiv) loaderDiv.style.display = 'block';
                            if (mapPrintDiv) mapPrintDiv.style.display = 'none';
                            if (printerButton) printerButton.style.display = 'none';

                            let template = new PrintTemplate();
                            //template.label = (document.getElementById("drpPrintLayout") as HTMLInputElement).value;
                            template.layout = ((document.getElementById("drpPrintLayout") as HTMLInputElement).value) as __esri.PrintTemplate["layout"];
                            template.format = "pdf";
                            template.exportOptions = {
                                width: view.width,
                                height: view.height,
                                dpi: 96
                            };
                            // template.preserveScale = true;
                            // template.showAttribution = false;
                            let outSacle = (document.getElementById("drpScale") as HTMLInputElement).value;
                            if (outSacle !== "Auto") {
                                template.outScale = parseInt(outSacle);
                            }
                            template.layoutOptions = {};
                            let customTextElements = [
                                { "Client": (document.getElementById("txtPrintClient") as HTMLInputElement).value },
                                { "Project": (document.getElementById("txtPrintProject") as HTMLInputElement).value },
                                { "Map Title": (document.getElementById("txtPrintTitle") as HTMLInputElement).value },
                                { "Figure Number": (document.getElementById("txtPrintFigureNumber") as HTMLInputElement).value },
                                { "Project Number": (document.getElementById("txtPrintProjectCode") as HTMLInputElement).value },
                                { "Staff Initials": (document.getElementById("txtStaffInitial") as HTMLInputElement).value }
                            ];
                            template.layoutOptions.customTextElements = customTextElements;

                            let params = new PrintParameters();
                            params.view = view
                            params.template = template;
                            params.extraParameters = {
                                Other_Parameters: JSON.stringify({
                                    scale: template.outScale
                                })
                            };

                            print.execute("https://webapps.tonkinandtaylorgroup.com/server/rest/services/UtilityServices/TT_WebTemplates_BETA/GPServer/Export Web Map", params).then(printResult).catch(printError);
                        });
                    }


                    async function printResult(result) {
                        if (loaderDiv) loaderDiv.style.display = 'none';
                        if (printerButton) printerButton.style.display = 'inherit';
                        await downloadFile("map_print.pdf", result.url)
                    }
                    async function downloadFile(fileName, url) {

                        const link = document.createElement('a');
                        link.href = await toDataURL(url);
                        link.setAttribute('download', fileName ? fileName : url.split('/').pop());
                        link.setAttribute('target', 'blank');
                        document.body.appendChild(link);
                        link.click();
                    }

                    function toDataURL(url) {
                        return fetch(url)
                            .then((response) => {
                                return response.blob();
                            })
                            .then((blob) => {
                                return URL.createObjectURL(blob);
                            });
                    }

                    function printError(err) {
                        alert("Something broke: ");
                        if (loaderDiv) loaderDiv.style.display = 'none';
                        if (printerButton) printerButton.style.display = 'inherit';
                    }

                    view.ui.add(["mapPrintContainer"], "bottom-right");

                });
            });
        }
    }, []);

    return (
        <UserLayout>
            <div className="mapDiv" ref={mapDiv}></div>
            <div id="myOwnPrinterButton" className="esri-component esri-widget--button esri-widget" role="button"><span title="Print" id="custom-printer" className="esri-icon esri-icon-printer"></span></div>
            <div id="mapPrintContainer" className="printContainer componentResult hidden">
                <div className="printInnerContainer">
                    <table width="100%" cellPadding={"3"} cellSpacing="0">
                        <tbody><tr>
                            <td>
                                <span className="title">Export Map</span>
                            </td>
                            <td align="right">
                                <span title="close" className="esri-icon esri-icon-close pointer" id="mapbtnPrintClose" ></span>
                            </td>
                        </tr>
                        </tbody></table>

                    <div className="printTable">
                        <div className="printRow">
                            <span className="printLabel">Template</span>
                            <span className="printInput">
                                <select id="drpPrintLayout">
                                    <option value="TTNZ A3 Landscape">TTNZ A3 Landscape</option>
                                    <option value="TTNZ A3 Portrait">TTNZ A3 Portrait</option>
                                    <option value="TTNZ A3 Square Template">TTNZ A3 Square Template</option>
                                    <option value="TTAU A3 Landscape">TTAU A3 Landscape</option>
                                    <option value="TTAU A3 Portrait">TTAU A3 Portrait</option>
                                    <option value="TTAU A3 Square Template">TTAU A3 Square Template</option>
                                    <option value="MAP_ONLY">MAP Only</option>
                                    <option value="TT A5 Landscape Simple Template">TT A5 Landscape Simple Template</option>
                                    <option value="TT A5 Portrait Simple Template">TT A5 Portrait Simple Template</option>
                                </select>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Scale</span>
                            <span className="printInput">
                                <select id="drpScale">
                                    <option value="Auto">Auto</option>
                                    <option value="100">100</option>
                                    <option value="250">250</option>
                                    <option value="500">500</option>
                                    <option value="750">750</option>
                                    <option value="1000">1000</option>
                                    <option value="2500">2500</option>
                                    <option value="5000">5000</option>
                                    <option value="10000">10000</option>
                                    <option value="25000">25000</option>
                                    <option value="50000">50000</option>
                                    <option value="100000">100000</option>
                                </select>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Client</span>
                            <span className="printInput">
                                <input type="text" id="txtPrintClient" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Project</span>
                            <span className="printInput">
                                <input type="text" id="txtPrintProject" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Title</span>
                            <span className="printInput">
                                <input type="text" id="txtPrintTitle" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Figure No.</span>
                            <span className="printInput">
                                <input type="text" id="txtPrintFigureNumber" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Project No.</span>
                            <span className="printInput">
                                <input type="text" id="txtPrintProjectCode" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">Staff Initial</span>
                            <span className="printInput">
                                <input type="text" id="txtStaffInitial" className="txt"></input>
                            </span>
                        </div>
                        <div className="printRow">
                            <span className="printLabel">&nbsp;</span>
                            <span className="printInput">
                                <input type="button" id="mapbtnPrintMap" className="printButton buttonGray" value="Print"></input>
                            </span>
                        </div>
                    </div>
                </div>
                <div id="loader" className="lds-facebook"><div></div><div></div><div></div></div>
            </div>
        </UserLayout>
    )

}
