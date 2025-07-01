{
    "Oid": "a83e833d-1d75-46c0-8f00-15fc498dd937",
        "ItemType": "3adfb47a-eab4-4d44-bde9-efae1bec8543",
            "dCreatedAt": "2025-06-13",
                "dUpdatedAt": "2025-07-01",
                    "PubPost": "a83e833d-1d75-46c0-8f00-15fc498dd937",
                        "ppCountComment": 0,
                            "ppFeaturedApproved": null,
                                "ppCountLogs": 0,
                                    "ppCountFiles": 0,
                                        "ppCountDocuments": null,
                                            "ppCountRecurring": null,
                                                "SalesAmountMinimum": null,
                                                    "CodeOthers": null,
                                                        "Label": "555555555",
                                                            "Company": "d3170153-6b16-4397-bf89-96533ee149ee",
                                                                "CompanyName": "testcase",
                                                                    "Weight": null,
                                                                        "Remark": null,
                                                                            "Code": "123508",
                                                                                "PurchaseBusinessPartner": null,
                                                                                    "PurchaseBusinessPartnerName": null,
                                                                                        "ItemGroup": "55692914-7402-4dd8-adec-40a823222b3e",
                                                                                            "ItemGroupName": "PRODUCT LAIN - LAIN",
                                                                                                "ItemGroup2": null,
                                                                                                    "ItemGroup2Name": null,
                                                                                                        "ItemGroup3": null,
                                                                                                            "ItemGroup3Name": null,
                                                                                                                "IsActive": "Y",
                                                                                                                    "BalanceAmount": "0.0000",
                                                                                                                        "ItemTypeName": "Product",
                                                                                                                            "ItemTypeCode": "Product",
                                                                                                                                "RowCountNumber": 1,
                                                                                                                                    "State": [
                                                                                                                                        {
                                                                                                                                            "Icon": "whatshot",
                                                                                                                                            "Color": "ff7369",
                                                                                                                                            "Oid": "new",
                                                                                                                                            "key": "new",
                                                                                                                                            "Name": "Just Updated",
                                                                                                                                            "Column": "1/6",
                                                                                                                                            "fieldToSave": "Status"
                                                                                                                                        }
                                                                                                                                    ],
                                                                                                                                        "ActionView": {
        "name": "Open",
            "icon": "EyeIcon",
                "type": "open_view2",
                    "show": true,
                        "get": "item/a83e833d-1d75-46c0-8f00-15fc498dd937?field=view2"
    },
    "CommentsPost": "publiccomment/create?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937&Type=Item",
        "ListFormat": {
        "Oid": "a83e833d-1d75-46c0-8f00-15fc498dd937",
            "Title": "TESTCASE",
                "Subtitle": "123508",
                    "RightSub": null,
                        "Right": null,
                            "Color": "#F6FF47",
                                "Icon": "chevron-down",
                                    "State": [
                                        {
                                            "Icon": "whatshot",
                                            "Color": "ff7369",
                                            "Oid": "new",
                                            "key": "new",
                                            "Name": "Just Updated",
                                            "Column": "1/6",
                                            "fieldToSave": "Status"
                                        }
                                    ],
                                        "Data": {
            "dCreatedAt": "2025-06-13",
                "dUpdatedAt": "2025-07-01",
                    "Label": "555555555",
                        "ItemGroupName": "PRODUCT LAIN - LAIN",
                            "IsActive": "Y",
                                "BalanceAmount": "0.0000",
                                    "ItemTypeName": "Product",
                                        "ItemTypeCode": "Product",
                                            "RowCountNumber": 1
        },
        "Details": [
            {
                "Name": "dCreatedAt",
                "Icon": null,
                "Value": "2025-06-13"
            },
            {
                "Name": "dUpdatedAt",
                "Icon": null,
                "Value": "2025-07-01"
            },
            {
                "Name": "Label",
                "Icon": null,
                "Value": "555555555"
            },
            {
                "Name": "ItemGroupName",
                "Icon": null,
                "Value": "PRODUCT LAIN - LAIN"
            },
            {
                "Name": "IsActive",
                "Icon": null,
                "Value": "Y"
            },
            {
                "Name": "BalanceAmount",
                "Icon": null,
                "Value": "0.0000"
            },
            {
                "Name": "ItemTypeName",
                "Icon": null,
                "Value": "Product"
            },
            {
                "Name": "ItemTypeCode",
                "Icon": null,
                "Value": "Product"
            },
            {
                "Name": "RowCountNumber",
                "Icon": null,
                "Value": 1
            }
        ]
    },
    "Action": [
        {
            "name": "Quick Edit Product",
            "icon": "PlusIcon",
            "type": "global_form",
            "showModal": false,
            "post": "item/save?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937",
            "organize": "topButton",
            "afterRequest": "init",
            "get": "item/a83e833d-1d75-46c0-8f00-15fc498dd937?field=Product",
            "config": "item/configadd?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937&field=Product"
        },
        {
            "name": "Edit In Detail",
            "icon": "EditIcon",
            "type": "open_form",
            "url": "form/item?item=a83e833d-1d75-46c0-8f00-15fc498dd937",
            "newTab": true,
            "show": false
        },
        {
            "name": "Setup Bundle",
            "icon": "LinkIcon",
            "type": "open_grid",
            "display": "table",
            "get": "item2/itemlinklist?ItemParent=a83e833d-1d75-46c0-8f00-15fc498dd937",
            "topButton": {
                "name": "Add Link",
                "icon": "BookOpenIcon",
                "type": "global_form2",
                "post": "item2/itemlinkadd?ItemParent=a83e833d-1d75-46c0-8f00-15fc498dd937",
                "afterRequest": "init",
                "config": "item/configitembundle"
            },
            "reopenMultiGrid": true
        },
        {
            "name": "Open Stock Value",
            "icon": "SearchIcon",
            "type": "open_viewreport",
            "showModal": true,
            "get": "report/generator?Module=ReportStockValue&action=vueview&report=stockvalue_06-1&Company=d3170153-6b16-4397-bf89-96533ee149ee&Item=a83e833d-1d75-46c0-8f00-15fc498dd937&Oid=a83e833d-1d75-46c0-8f00-15fc498dd937&DateStart=2025-07-01&DateEnd=2025-07-31"
        },
        {
            "name": "Print Barcode",
            "icon": "PrinterIcon",
            "type": "printzebra_form",
            "hide": false,
            "post": "zebra/itemprint?oid=a83e833d-1d75-46c0-8f00-15fc498dd937",
            "afterRequest2": "printzebra",
            "form": [
                {
                    "fieldToSave": "Oid",
                    "hideInput": true,
                    "type": "selectedrows"
                },
                {
                    "fieldToSave": "qty",
                    "type": "inputtext",
                    "default": 1,
                    "overrideLabel": "Quantity"
                }
            ]
        },
        {
            "name": "replace & delete",
            "icon": "TrashIcon",
            "type": "global_form2",
            "showModal": false,
            "post": "data/item/delete?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937",
            "afterRequest": "init",
            "form": [
                {
                    "fieldToSave": "Replace",
                    "hiddenField": "ReplaceName",
                    "type": "autocomplete",
                    "source": [],
                    "store": "autocomplete/item",
                    "params": {
                        "term": "",
                        "itemtypecode": "Product"
                    },
                    "validationParams": null
                },
                {
                    "fieldToSave": "GCRecordNote",
                    "overrideLabel": "Remark",
                    "type": "inputtext",
                    "validationParams": "required",
                    "column": "1/1",
                    "default": null,
                    "placeHolder": "Remark"
                }
            ]
        },
        {
            "name": "Send to Chat",
            "icon": "MessageCircleIcon",
            "type": "global_form2",
            "post": "data/sendtochat?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937&Module=Item",
            "organize": "share",
            "form": [
                {
                    "fieldToSave": "User",
                    "hiddenField": "UserName",
                    "type": "autocomplete",
                    "column": "1/3",
                    "source": [],
                    "store": "autocomplete/user",
                    "params": {
                        "type": "combo",
                        "term": ""
                    }
                },
                {
                    "fieldToSave": "Message",
                    "validationParams": "required",
                    "type": "inputarea",
                    "default": null
                }
            ]
        },
        {
            "name": "Help",
            "icon": "HelpCircleIcon",
            "type": "open_help",
            "get": "development/knowledgebase/help/mstitem"
        }
    ],
        "DefaultAction": {
        "name": "Quick Edit Product",
            "icon": "PlusIcon",
                "type": "global_form",
                    "showModal": false,
                        "post": "item/save?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937",
                            "organize": "topButton",
                                "afterRequest": "init",
                                    "get": "item/a83e833d-1d75-46c0-8f00-15fc498dd937?field=Product",
                                        "config": "item/configadd?Oid=a83e833d-1d75-46c0-8f00-15fc498dd937&field=Product"
    }
}