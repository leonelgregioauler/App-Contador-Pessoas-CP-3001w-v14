/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define([
  "knockout",
  "appController",
  "ojs/ojmodule-element-utils", 
  "accUtils",
  "ojs/ojcontext",
  "../dataBase",
  "ojs/ojarraydataprovider",
  "ojs/ojknockout-keyset",
  "ojs/ojkeyset",
  "ojs/ojasyncvalidator-regexp",
  "viewModels/dashboard",
  "../httpUtil",
  "ojs/ojknockout",
  "ojs/ojinputtext",
  "ojs/ojinputnumber",
  "ojs/ojlabel",
  "ojs/ojbutton",
  "ojs/ojformlayout",
  "ojs/ojmessaging",
  "ojs/ojlistview",
  "ojs/ojlistitemlayout",
  "ojs/ojdialog",
  "ojs/ojselectsingle",
  "ojs/ojswitch"
], function (ko, app, moduleUtils, accUtils, Context, DataBase, ArrayDataProvider, keySet, KeySetImpl, AsyncRegExpValidator, Dash, Util) {
  function ControladoraViewModel() {
    var self = this;

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.currentIndex;
    
      const date = new Date();
      const day = (date.getDate()).toLocaleString('pt-BR', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      const month = (date.getMonth() + 1).toLocaleString('pt-BR', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      const year = date.getFullYear();
      
      const appVersion = `Neo CP 3001w - v 2025.0215.1`;
      
      self.appVersion = ko.observable(appVersion);

      self.networkInformation = Dash.config.networkInformation;

      self.controllerRegistration = {
        idControladora : ko.observable(),
        descricaoControladora : ko.observable(''),
        IP : ko.observable(''),
        URL : ko.observable(''),
        fonteDados : ko.observable(''),
        horaInicioTurno1 : ko.observable(),
        horaFimTurno1 : ko.observable(),
        horaInicioTurno2 : ko.observable(),
        horaFimTurno2 : ko.observable(),
        exibeDashBoard : ko.observable(true),
        SSIDRoteador : ko.observable(''),
        senhaRoteador : ko.observable(''),
        eMail : ko.observable(''),
        nomeEstabelecimento : ko.observable(''),
        ramoAtividade : ko.observable(''),
        enableConfigurationFieldsButtons : ko.observable(false)
      }

      self.idControladoraToSelected = ko.observable();
      
      self.dataController = ko.observableArray([]);
      self.showListView = ko.observable(false);

      self.queryController = async function () {
        
        DataBase.queryController('SELECT * FROM CONTROLADORAS').then( (result) => {

          self.dataController(result);
          self.showListView(true);
          
          var items = self.dataController();
          var array = items.map(function(e) {
            return e.idControladora;
          });
          self.lastItemId = Math.max.apply(null, array);
          self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );

          let data = result.map( (item) => {
            if (item.exibeDashBoard == true) {
              return item 
            }
          })

          return data.filter( (item) => {
            return item;
          })
        })
        .then ((data) => {
          if (data.length > 0) {
            setListItemSelected(data[0].value);
            self.queryAvailableSSIDs();
          } else {
            self.controllerRegistration.exibeDashBoard(false);
            setListItemSelected(self.idControladoraToSelected());
          }
        })
      }
      self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );
      
      self.selectedItems = new keySet.ObservableKeySet();
      
      function setListItemSelected (key) {
        let keySI = new Set();
        keySI.add(key);
        keySI = new KeySetImpl.KeySetImpl(keySI);
        document.getElementById("listview").setProperty("selected", keySI);
      };
      
      self.isTextEmpty = ko.observable(true);
      
      // usar parametro disabled="[[isTextAndSelecionFilled]]" no oj-button
      self.isTextAndSelecionFilled = ko.computed(function(){
        return  ( !self.isTextEmpty() && !self.isSelectionEmpty()) || self.isTextEmpty();
      }, self);

      self.isSelectionEmpty = ko.computed(function () {
        return self.selectedItems().values().size === 0;
      }, self);
      self.isTextOrSelectionEmpty = ko.computed(function () {
        return self.isTextEmpty() || self.isSelectionEmpty();
      }, self);
      self.isSSIDPasswordEmpty = ko.computed(function () {
        return !( self.controllerRegistration.SSIDRoteador() && self.controllerRegistration.senhaRoteador() )
      }, self);
      
      self.isDataSourceRemote = ko.computed(function() {
        return !self.controllerRegistration.enableConfigurationFieldsButtons() || (self.controllerRegistration.fonteDados() == "" || self.controllerRegistration.fonteDados() == 'URL');
      }, self);

      self.isControllerCreated = ko.computed(function() {
        return !self.controllerRegistration.enableConfigurationFieldsButtons();
      }, self);
    
      self.addItem = function () {
        var itemToAdd = self.controllerRegistration.IP();

        const controller = {
          idControladora : self.controllerRegistration.idControladora() || 1,
          descricaoControladora : self.controllerRegistration.descricaoControladora(),
          IP : self.controllerRegistration.IP(),
          URL : self.controllerRegistration.URL(),
          fonteDados : self.controllerRegistration.fonteDados(),
          horaInicioTurno1 : self.controllerRegistration.horaInicioTurno1(), 
          horaFimTurno1 : self.controllerRegistration.horaFimTurno1(), 
          horaInicioTurno2 : self.controllerRegistration.horaInicioTurno2(), 
          horaFimTurno2 : self.controllerRegistration.horaFimTurno2(),
          exibeDashBoard : self.controllerRegistration.exibeDashBoard(true),
          SSIDRoteador : self.controllerRegistration.SSIDRoteador(),
          senhaRoteador : self.controllerRegistration.senhaRoteador(),
          eMail : self.controllerRegistration.eMail(),
          nomeEstabelecimento : self.controllerRegistration.nomeEstabelecimento(),
          ramoAtividade : self.controllerRegistration.ramoAtividade()
        }

        if ((itemToAdd !== '')) {
          DataBase.insertController(controller);
          self.showListView(false);
          self.queryController();
          self.controllerRegistration.descricaoControladora();
          self.controllerRegistration.IP();
          self.controllerRegistration.URL();
          self.controllerRegistration.fonteDados();
          self.controllerRegistration.horaInicioTurno1();
          self.controllerRegistration.horaFimTurno1();
          self.controllerRegistration.horaInicioTurno2();
          self.controllerRegistration.horaFimTurno2();
          self.controllerRegistration.SSIDRoteador();
          self.controllerRegistration.senhaRoteador();
          self.controllerRegistration.eMail();
          self.controllerRegistration.nomeEstabelecimento();
          self.controllerRegistration.ramoAtividade();
        }

        /// CRISTIAN PEDIU PARA DESATIVAR POR ENQUANTO !!!  self.adjustOfficeHoursController();

      }.bind(self);
    
      self.updateSelected = async function () {

        var itemToReplace = self.dataController()[self.currentIndex];
        
        const controller = { 
          value: itemToReplace.value, 
          label: self.controllerRegistration.descricaoControladora(), 
          idControladora: itemToReplace.idControladora, 
          descricaoControladora : self.controllerRegistration.descricaoControladora(),
          IP : self.controllerRegistration.IP(), 
          URL : self.controllerRegistration.URL(),
          fonteDados : self.controllerRegistration.fonteDados(),
          horaInicioTurno1 : self.controllerRegistration.horaInicioTurno1(), 
          horaFimTurno1 : self.controllerRegistration.horaFimTurno1(), 
          horaInicioTurno2 : self.controllerRegistration.horaInicioTurno2(), 
          horaFimTurno2 : self.controllerRegistration.horaFimTurno2(),
          exibeDashBoard : self.controllerRegistration.exibeDashBoard(true),
          SSIDRoteador : self.controllerRegistration.SSIDRoteador(),
          senhaRoteador : self.controllerRegistration.senhaRoteador(),
          eMail : self.controllerRegistration.eMail(),
          nomeEstabelecimento : self.controllerRegistration.nomeEstabelecimento(),
          ramoAtividade : self.controllerRegistration.ramoAtividade()
        }
        DataBase.updateController(controller);
        self.queryController();
        /// CRISTIAN PEDIU PARA DESATIVAR POR ENQUANTO !!! self.adjustOfficeHoursController();
      
      }.bind(self);
    
      self.close = function(event) {
        document.getElementById("modalDialogExcluirCadastro").close();
      }
      self.open = function(event) {
        document.getElementById("modalDialogExcluirCadastro").open();
      }

      self.removeSelected = function () {
        const items = self.dataController();
        var itemToRemove = self.dataController()[self.currentIndex];
        const controllerLeft = items.filter( (config, index) => {
          return config.idControladora !== itemToRemove.idControladora
        })
        self.close();
        DataBase.deleteController(itemToRemove.idControladora);
        self.showListView(false);
        self.queryController();
        self.controllerRegistration.descricaoControladora('');
        self.controllerRegistration.IP('');
        self.controllerRegistration.URL('');
        self.controllerRegistration.fonteDados('');
        self.controllerRegistration.SSIDRoteador('');
        self.controllerRegistration.senhaRoteador('');
        self.controllerRegistration.eMail('');
        self.controllerRegistration.nomeEstabelecimento('');
        self.controllerRegistration.ramoAtividade('');
        (controllerLeft.length > 0) ? self.idControladoraToSelected(controllerLeft[0].value) : null;
        
      }.bind(self);
      
      // usar parametro on-current-item-changed="[[handleCurrentItemChanged]]" no oj-list-view
      self.handleCurrentItemChanged = function (event) {
        var key = event.detail.value;
        ///self.controllerRegistration.enableConfigurationFieldsButtons(true);
        populateFields(key);
      }.bind(self);

      // usar parametro on-selected-changed="[[handleSelectedChanged]]" no oj-list-view
      self.handleSelectedChanged = function (event) {
        var key = Array.from(event.detail.value.values())[0];
        if (key) {
          self.controllerRegistration.enableConfigurationFieldsButtons(true);
        } else {
          self.controllerRegistration.enableConfigurationFieldsButtons(false);
        }
        populateFields(key);
      }.bind(self);

      populateFields = (key) => {
        var items = self.dataController();
        var indice = items.map(function(e) {
          return e.idControladora;
        }).indexOf(key);

        for (var i = 0; i < items.length; i++) { 
          if (i === indice) {
            self.currentIndex = i;
            self.controllerRegistration.idControladora(items[i].idControladora);
            self.controllerRegistration.descricaoControladora(items[i].descricaoControladora);
            self.controllerRegistration.IP(items[i].IP);
            self.controllerRegistration.URL(items[i].URL);
            self.controllerRegistration.fonteDados(items[i].fonteDados);
            self.controllerRegistration.SSIDRoteador(items[i].SSIDRoteador);
            self.controllerRegistration.senhaRoteador(items[i].senhaRoteador);
            self.controllerRegistration.eMail(items[i].eMail);
            self.controllerRegistration.nomeEstabelecimento(items[i].nomeEstabelecimento);
            self.controllerRegistration.ramoAtividade(items[i].ramoAtividade);
            self.controllerRegistration.horaInicioTurno1(items[i].horaInicioTurno1);
            self.controllerRegistration.horaFimTurno1(items[i].horaFimTurno1);
            self.controllerRegistration.horaInicioTurno2(items[i].horaInicioTurno2);
            self.controllerRegistration.horaFimTurno2(items[i].horaFimTurno2);
            self.controllerRegistration.exibeDashBoard(items[i].exibeDashBoard);
            break;
          }
        }
      }

      self.selectedIds = ko.observable();
      
      self.handleRawValueChanged = function (event) {
        var value = event.detail.value;
        self.isTextEmpty(value.trim().length === 0);
      }.bind(self);

      // usar parametro on-raw-value-changed="[[handleRawValueChangedFormatIP]] no oj-input-text
      self.handleRawValueChangedFormatIP = function (event) {
        var value = event.detail.value;
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})/, "$1.$2.$3.$4");
        self.controllerRegistration.IP(value);
      }.bind(self);
      
      let options = new Object();

      /* options = {
        pattern: "[a-zA-Z0-9:/.-]+",
        hint: "Informe um valor de IP válido",
        messageDetail: "Informe um valor de IP válido",
      } */
      
      options = {
        pattern: "\\d{1,3}\\.{1}\\d{1,3}\\.{1}\\d{1,3}\\.{1}\\d{1,3}",
        hint: "Informe um valor de IP válido",
        messageDetail: "Informe um valor de IP válido",
      }

      self.validators = [
        new AsyncRegExpValidator(options)
      ];

      this.dataSourceOptions = [
        { value: 'IP', label: 'LOCAL' },
        { value: 'URL', label: 'INTERNET' }
      ];
      this.dataSourceOptionsDP = ko.observable(new ArrayDataProvider(this.dataSourceOptions, { keyAttributes: 'value' }));

      this.selectListValueChanged = (data) => {
        console.log(data);
        this.controllerRegistration.fonteDados(data.detail.value);
      }

      /// SSID
      this.dataSourceSSID = ko.observableArray();

      const controller = Dash.config.controller;

      self.queryAvailableSSIDs = async () => {

        let itemControl = {
          fonteDados : "IP",
          IP : self.controllerRegistration.IP()
        }

        Util.callGetService(itemControl, controller, 'AVAILABLE_SSIDS').then( (response) => {

          wifi = response.wifi.map(item => {
            return {
              value: item.ssid,
              label: item.ssid
            }
          })

          this.dataSourceSSID(wifi);
          
          this.dataSourceSSIDDP = ko.observable(new ArrayDataProvider(this.dataSourceSSID, { keyAttributes: 'value' }));
        })
        .catch(err => {
          console.log('Não encontrou dispositivo conectado.' + err);
        })
      }

      this.dataSourceSSIDDP = ko.observable(new ArrayDataProvider(this.dataSourceSSID, { keyAttributes: 'value' }));

      this.selectListValueChangedSSID = (data) => {
        this.controllerRegistration.SSIDRoteador(data.detail.value);
      }

      self.connectToDevice = async function () {
        let itemControl = {
          fonteDados : "XX",
          IP : self.controllerRegistration.IP(),
          SSIDRoteador: self.controllerRegistration.SSIDRoteador(),
          senhaRoteador: self.controllerRegistration.senhaRoteador(),
          eMail: self.controllerRegistration.eMail(),
          nomeEstabelecimento: self.controllerRegistration.nomeEstabelecimento(),
          ramoAtividade: self.controllerRegistration.ramoAtividade(),
          subNet: self.networkInformation.subNet()
        }

        //let controller = new Object();

        let endpoint1 = await Util.callGetService(itemControl, controller, 'ATUALIZAR_CONFIGURACAO_DISPOSITIVO')
        .then( (response) => {
            if (response) {
              self.updateSelected();
              self.closeConnectToDevice();
            }
        })
        .catch( (err) => {
          self.closeConnectToDevice()
        })
      }

      self.openConnectToDevice = function(event) {
        document.getElementById("modalDialogConectarRoteador").open();
      }
      self.closeConnectToDevice = function(event) {
        document.getElementById("modalDialogConectarRoteador").close();
      }

      self.updateDateHourController = async function () {

        let itemControl = {
          IP : self.controllerRegistration.IP(),
          fonteDados : "XX"
        }

        //let controller = new Object();

        let endpoint1 = await Util.callGetService(itemControl, controller, 'ATUALIZAR_DATA_ROTEADOR')
        .then( (response) => {
            if (response) {
              console.log(response);
            }
        })
        .catch( (err) => {
          console.log(err);
        })

        let endpoint2 = await Util.callGetService(itemControl, controller, 'ATUALIZAR_HORA_ROTEADOR')
        .then( (response) => {
          if (response) {
            ///self.closeUpdateDateHourController();
            console.log(response);
          }
        })
        .catch( (err) => {
          ///self.closeUpdateDateHourController();
          console.log(err);
        })
      }

      /* self.openUpdateDateHourController = function(event) {
        document.getElementById("modalDialogAtualizarDataHora").open();
      } */
      /* self.closeUpdateDateHourController = function(event) {
        document.getElementById("modalDialogAtualizarDataHora").close();
      } */

      self.adjustSensorDirectionController = async () => {

        let itemControl = {
          IP : self.controllerRegistration.IP(),
          fonteDados : "XX"
        }

        //let controller = new Object();

        let endpoint1 = await Util.callGetService(itemControl, controller, 'AJUSTAR_DIRECAO_SENSOR')
        .then( (response) => {
          if (response) {
            self.closeAdjustSensorDirectionController();
          }
        })
        .catch( (err) => {
          self.closeAdjustSensorDirectionController();
        })
      }

      self.openAdjustSensorDirectionController = function(event) {
        document.getElementById("modalDialogAjustarDirecaoSensor").open();
      }
      self.closeAdjustSensorDirectionController = function(event) {
        document.getElementById("modalDialogAjustarDirecaoSensor").close();
      }


      self.adjustOfficeHoursController = async () => {

        let itemControl = {
          IP : self.controllerRegistration.IP(),
          horaInicioTurno1 : self.controllerRegistration.horaInicioTurno1(),
          horaFimTurno2 : self.controllerRegistration.horaFimTurno2(),
          fonteDados : "XX"
        }

        //let controller = new Object();

        let endpoint1 = await Util.callGetService(itemControl, controller, 'AJUSTAR_HORARIO_EXPEDIENTE')
        .then( (response) => {
          console.log(response);
        })
        .catch( (err) => {
          console.log(err);
        })
      }

      function onError( error ) {
        self.networkInformation.ipInformation('');
        self.networkInformation.subnetInformation('');
      }

      self.consultarIPRede = function () {
        self.controllerRegistration.IP(self.networkInformation.IP());
      }

      function onSuccess( ipInformation ) {
        let IP = (ipInformation.ip) ? ipInformation.ip : ipInformation;
        IP = IP.split('.').slice(0, 3);
        IP.push("10");
        IP = IP.join('.');
        const ipInfo = (ipInformation.ip) ? `\nIP : ${ipInformation.ip}` : `\nIP : ${ipInformation}`;
        const subNetInfo = (ipInformation.subnet) ? `\nSub-rede : ${ipInformation.subnet}` : `\nSub-rede : Desconhecida.`;
        if (ipInformation) {
          self.networkInformation.IP(IP);
          self.networkInformation.ipInformation(ipInfo);
          self.networkInformation.subnetInformation(subNetInfo); 
        } else {
          self.controllerRegistration.IP('');
          self.networkInformation.IP('');
          self.networkInformation.ipInformation('');
          self.networkInformation.subnetInformation('');
        }
      }

      networkinterface.getWiFiIPAddress(onSuccess, onError);

      self.connected = function () {
        accUtils.announce("Controladora page loaded.", "assertive");
        document.title = "Controladora";
        //DataBase.dropDataBase();
        //DataBase.createDataBase();
        self.queryController();
      };

      self.disconnected = function () {};

      self.transitionCompleted = function () {};
    }

    return ControladoraViewModel;
  }
);