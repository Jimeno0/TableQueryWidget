define(['dojo/_base/declare',
  'jimu/BaseWidget',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'dojo/dom-construct',
  'dojo/_base/array', 
  'dojo/dom',
  'dojo/on',
  'esri/layers/FeatureLayer',
  'esri/graphic',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/Color',
  'esri/config',
  'bootstrap/Dropdown',
  'bootstrap/Tab',
  'bootstrap/Modal'
 ],
  function(declare, BaseWidget,Query, QueryTask, domConstruct, arrayUtils, dom, on, FeatureLayer,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,Color,esriConfig) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here

      //Propiedades
      baseClass: 'jimu-widget-customwidget',

      startup: function() {
        //get config variables
        tableconfigParams = this.config.inPanelVar.params.tableConfigParams;
        queyconfigParams = this.config.inPanelVar.params.queryConfigParams;
        //Set table headers
        var cabecera = document.getElementById("tableHeader").insertRow(0);
        for (i = 0; i < tableconfigParams.length; i++) {
          var contenidoCabecera = tableconfigParams[i].header;
          var newCell = cabecera.insertCell(i);
          newCell.innerHTML = contenidoCabecera;
        };
        //Set query dropdown menus
        for (i = 0; i < queyconfigParams.length; i++) {
          var btnName = queyconfigParams[i].buttonName;
          var dropDiv = domConstruct.create("div", {
            'class':"dropdown btn-group"
            }, "queryBtnsDiv");
          var queryBtn = domConstruct.create("button", {
            class:"btn btn-default dropdown-toggle",
            'innerHTML':btnName,
            'data-toggle':"dropdown",
            'aria-haspopup':"true",
            'aria-expanded':"false"
              }, dropDiv);
          var spanBtn = domConstruct.create("span", {class:"caret"}, queryBtn);
          var ulBtn = domConstruct.create("ul", {class:"dropdown-menu"}, dropDiv);
          for (n = 0; n < queyconfigParams[i].liParamsArray.length; n++) {
            var liName = queyconfigParams[i].liParamsArray[n].liName;
            var liQuery = queyconfigParams[i].liParamsArray[n].query;
            var liBtn = domConstruct.create("li", {}, ulBtn);
            var aLiBtn = domConstruct.create("a", {
              'innerHTML':liName,
              'onClick' : "funcionQuery('" + liQuery + "');"
              }, liBtn);
            };
          };
      },

      onOpen: function(){
        this.inherited(arguments);
        var that = this;
        serviceUrl = this.config.inPanelVar.params.serviceUrl;
        funciOnClick = funciOnClick2;
        funcionQuery = funcionQuery2;
        var OutFieldsArray = new Array();
        //Clean existing table rows
        var node = document.getElementById('tableContent');
        while (node.hasChildNodes()) {
          node.removeChild(node.firstChild);
        };
        //Query where we get all features (every time we open the widget)
        var query = new Query();
        query.where ="1=1";
        for (i = 0; i < tableconfigParams.length; i++) {
          OutFieldsArray[i] = tableconfigParams[i].fieldName;
        };
        OutFieldsArray.push("OBJECTID");
        query.outFields = OutFieldsArray;
        var queryTask = new QueryTask(serviceUrl);
        queryTask.execute(query,addColumns);
        addColumns2=addColumns;
        //Function that fills the table with the result features from the querys
        function addColumns(fsResult){
          var features = fsResult.features;
          //
          arrayUtils.forEach(features, function(feature){
            if (feature.attributes["OBJECTID"]) {
              var targetId = "OBJECTID="+feature.attributes["OBJECTID"];

            } else if (feature.attributes["objectid"]) {
              var targetId = "objectid="+feature.attributes["objectid"]
            };
            var featureRow = domConstruct.create("tr", {'onClick' : "funciOnClick('" + targetId + "');"}, "tableContent");
            for (i = 0; i < tableconfigParams.length; i++) {
              var attName = tableconfigParams[i].fieldName;
              var contenidoRow = feature.attributes[attName];

              var newCell = featureRow.insertCell(i);
              newCell.innerHTML = contenidoRow;
            };
          });
        };
        //Function to trigger when we click on a table row
        function funciOnClick2(e){
          //clear graphics map
          that.map.graphics.clear();
          //Query that gets the feature clicked
          var query2 = new Query();
          query2.where =e;
          query2.outFields = OutFieldsArray;
          query2.returnGeometry = true;
          query2.outSpatialReference = {wkid: 102100};
          var queryTask2 = new QueryTask(serviceUrl);
          queryTask2.execute(query2,drawSelected);
          //Function to draw the feature graphic
          function drawSelected(fs){
               
            for (i = 0; i < fs.features.length; i++) {
              var  featureSelected = fs.features[i];
              if (featureSelected.geometry.type == "point" ||featureSelected.geometry.type == "multiPoint") {
                var simbologia = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color([255,0,0]), 1),
                  new Color([0,255,0,0.25])
                );
                that.map.centerAndZoom(featureSelected.geometry);
              } else if (featureSelected.geometry.type == "lineString" ||featureSelected.geometry.type == "multiLineString") {
                var simbologia = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color([255,0,0]),4
                );
                that.map.setExtent(featureSelected.geometry.getExtent());
              }else if (featureSelected.geometry.type == "polygon" ||featureSelected.geometry.type == "multiPolygon") {
                var simbologia = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                  new Color([255,0,0]), 2),new Color([255,255,0,0.25])
                );
                that.map.setExtent(featureSelected.geometry.getExtent());
              };
              var graphicElemnts = new Graphic(featureSelected.geometry,simbologia,featureSelected.attributes);
              that.map.graphics.add(graphicElemnts);
            };
          };
        };
        //Query with the selected li from the dropdown button
        function funcionQuery2(e){
          var node = document.getElementById('tableContent');
          while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
          };
          var query = new Query();
          query.where = e;
          query.outFields = OutFieldsArray;
          query.returnGeometry = true;
          var queryTask = new QueryTask(serviceUrl);
          queryTask.execute(query,addColumns2);
        };
       },
      onClose: function(){
        this.map.graphics.clear();
       },
    });
  });