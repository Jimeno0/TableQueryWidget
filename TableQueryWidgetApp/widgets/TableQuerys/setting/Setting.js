define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'dojo/request',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/dom',
    'dojo/on', 
    'dijit/form/ValidationTextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/TextBox',
    'dijit/form/CheckBox'
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,request,domConstruct,query,dom,on) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      // Declaramos la clase CSS para los estilos
      baseClass: 'jimu-widget-in-panel-setting',
      _counters:{},

      startup: function() {
        this.inherited(arguments);
        var config = this.config;
        // if config doesnt exisist we create it
        config.inPanelVar = config.inPanelVar || {}
        config.inPanelVar.params = config.inPanelVar.params || {}
        this.setConfig(this.config);
      },
      // On open widget config
      setConfig: function(config) {
        this.config = config;
        var options = config.inPanelVar.params;
        // Load service URL if exisits
        if (options && options.serviceUrl) {
            this.serviceUrl.set('value', options.serviceUrl);
        };
        return this.config;
      },
      // On close widget config
      getConfig: function() {
        var options = this.config.inPanelVar.params;
        options.serviceUrl = this.serviceUrl.get("value");
        options.tableConfigParams = new Array();
        options.queryConfigParams = new Array();
        // Save header and content for each column
        for (i = 0; i < document.getElementById("columnsSettings").children.length; i++) {
          var rowParams = document.getElementById("columnsSettings").children[i];
          var rowHeaderChild = rowParams.children[1];
          var rowFieldChild = rowParams.children[3];
          var headerName = rowHeaderChild.children[0].value;
          var fieldName = rowFieldChild.children[0].value;
          tableParams[i] = {
            header:headerName,
            fieldName:fieldName
          };
        options.tableConfigParams[i] = tableParams[i];
         };
        //Save dropdown buttons names
        for (i = 0; i < document.getElementById("querySettings").children.length; i++) {
          var rowParams = document.getElementById("querySettings").children[i];
          var rowHeaderChild = rowParams.children[1];
          var headerName = rowHeaderChild.children[0].value;
          var  queryliParams = new Array();
          //Go over the table and save each query and query label for each dropdown button
          for (n = 0; n < rowParams.children[4].children[0].children.length; n++) {
            var rowLi = rowParams.children[4].children[0].children[n];
            var rowNameli = rowLi.children[1].children[0].value;
            var rowQuery = rowLi.children[3].children[0].value;
            queryliParams[n] = {
              liName:rowNameli,
              query:rowQuery
            };
          };
          queryParams[i] = {
            buttonName:headerName,
            liParamsArray:queryliParams
          };
          options.queryConfigParams[i] = queryParams[i];
        };
        return this.config;
      },
      checkUrl: function(){
        tableParams = new Array();
        queryParams = new Array();
        fields = this._counters.fields;
        this._counters.counter = 0;
        this._counters.counterQMenu = 0;
        this._counters.counterQli = 0;
        var that = this;
        //Ajax request to get the fields names
        var urlJson = this.serviceUrl.value+"?f=json";
        request(urlJson, {
          headers: {
            "X-Requested-With": null
          }
        }).then(
          function(text){
            var jsonObjet = JSON.parse(text);
           that._counters.fields = jsonObjet.fields;
           that.functAddRow();         
          },
          function(error){
            console.log("An error occurred: " + error);
          }
        );
        //FUcntion to delete the selectected row
        functDeleteRow = function(){
          this.parentElement.parentElement.remove();
        };
        //Function to add a row to set the parameters of a query li for the cropdown button
        functAddQueryLi = function(){
          var querysTable = this.parentElement.parentElement.children[4].children[0];
          var elementId = "idQli"+that._counters.counterQli;

          var row = domConstruct.toDom('<tr id="'+elementId+'">\
                                          <td>\
                                            Query name:\
                                          </td>\
                                          <td>\
                                            <input>\
                                          </td>\
                                          <td>\
                                            Insert query:\
                                          </td>\
                                          <td>\
                                            <input>\
                                          </td>\
                                          <td class="btnDeleteClass">\
                                          </td>\
                                        </tr>'); 

        var nl = query(".btnDeleteClass",row);
        var btnDelete =  domConstruct.toDom("<button>\
                                               Delete\
                                             </button>");
        on(btnDelete, "click", functDeleteRow);
          querysTable.appendChild(row);
          nl[0].appendChild(btnDelete);
          that._counters.counterQli++;
        };
      },
      //Function to add a row to set the parameters for each widget table columns
      functAddRow: function(){
        var elementId = "id"+this._counters.counter;
        var slectId = "select"+this._counters.counter;
        var row = domConstruct.toDom('<tr id="'+elementId+'">\
                                        <td>\
                                          Column header:\
                                        </td>\
                                        <td>\
                                          <input>\
                                        </td>\
                                        <td>\
                                          Column header:\
                                        </td>\
                                        <td>\
                                          <select class="selectClass">\
                                          </select>\
                                        </td>\
                                        <td class="btnDeleteClass">\
                                        </td>\
                                      </tr>'); 
            var nl2 = query(".selectClass",row);
            for (i = 0; i < this._counters.fields.length; i++) { 
              var fieldOption =  domConstruct.toDom("<option>\
                                                       "+this._counters.fields[i].name+"\
                                                     </option>");
              nl2[0].appendChild(fieldOption);
            };               
        var nl = query(".btnDeleteClass",row);
        var btnDelete =  domConstruct.toDom("<button>\
                                               Delete\
                                             </button>");

        on(btnDelete, "click", functDeleteRow);
        this._counters.counterQMenu++;
        document.getElementById("columnsSettings").appendChild(row);
        nl[0].appendChild(btnDelete);
      },
      //Function to add a row to set the parameters for each dropdown button
      functAddQueryMenu: function(){
        var elementId = "idQ"+this._counters.counterQMenu;
        var row = domConstruct.toDom('<tr id="'+elementId+'">\
                                        <td>\
                                          Dropdown button name:\
                                        </td>\
                                        <td>\
                                          <input>\
                                        </td>\
                                        <td class="btnDeleteClass">\
                                        </td>\
                                        <td class="btnAddQueryClass">\
                                        </td>\
                                        <td>\
                                          <table style="border:1px solid #000;">\
                                          </table>\
                                        </td>\
                                      </tr>');                                                                        
        var nl = query(".btnDeleteClass",row);
        var nl2 = query(".btnAddQueryClass",row);
        var btnDelete =  domConstruct.toDom("<button>\
                                               Delete\
                                             </button>");
        var btnAddQuery =  domConstruct.toDom("<button>\
                                               Add query element\
                                             </button>"); 
        on(btnDelete, "click", functDeleteRow);
        on(btnAddQuery, "click", functAddQueryLi);
        this._counters.counterQMenu++;
        document.getElementById("querySettings").appendChild(row);
        nl[0].appendChild(btnDelete);
        nl2[0].appendChild(btnAddQuery);
      }
    });
  });

